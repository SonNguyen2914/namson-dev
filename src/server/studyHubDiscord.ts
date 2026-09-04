import type Database from "better-sqlite3";
import { upsertSource } from "@/server/studyHubDb";

type Json = Record<string, unknown>;
type ChannelTarget = { channelId: string; courseId: string; courseSlug: string };

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
}

function configuredChannels(db: Database.Database): ChannelTarget[] {
  const raw = process.env.STUDY_HUB_DISCORD_CHANNELS_JSON?.trim();
  if (!raw) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("STUDY_HUB_DISCORD_CHANNELS_JSON is invalid JSON"); }
  if (!Array.isArray(parsed)) throw new Error("STUDY_HUB_DISCORD_CHANNELS_JSON must be an array");
  return parsed.flatMap((item) => {
    const value = asRecord(item);
    if (typeof value.courseSlug !== "string" || typeof value.channelId !== "string" || !/^\d{15,22}$/.test(value.channelId)) return [];
    const course = db.prepare("SELECT id, slug FROM courses WHERE slug=?").get(value.courseSlug) as { id: string; slug: string } | undefined;
    return course ? [{ channelId: value.channelId, courseId: course.id, courseSlug: course.slug }] : [];
  });
}

export function isDiscordConfigured() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  const channels = process.env.STUDY_HUB_DISCORD_CHANNELS_JSON?.trim();
  if (!token || !channels) return false;
  try {
    const parsed: unknown = JSON.parse(channels);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch { return true; }
}

function messageText(message: Json) {
  const parts = [typeof message.content === "string" ? message.content : ""];
  if (Array.isArray(message.attachments)) {
    for (const raw of message.attachments) {
      const attachment = asRecord(raw);
      if (typeof attachment.filename === "string") {
        parts.push(`Attachment: ${attachment.filename}${typeof attachment.url === "string" ? ` — ${attachment.url}` : ""}`);
      }
    }
  }
  if (Array.isArray(message.embeds)) {
    for (const raw of message.embeds) {
      const embed = asRecord(raw);
      if (typeof embed.title === "string") parts.push(embed.title);
      if (typeof embed.description === "string") parts.push(embed.description);
      if (typeof embed.url === "string") parts.push(embed.url);
    }
  }
  return parts.filter(Boolean).join("\n")
    .replace(/<@!?\d+>/g, "@student")
    .replace(/<@&\d+>/g, "@role")
    .replace(/<#\d+>/g, "#channel")
    .trim();
}

function greaterSnowflake(a: string, b: string) {
  try { return BigInt(a) > BigInt(b); } catch { return a > b; }
}

function cursorState(db: Database.Database) {
  const row = db.prepare("SELECT cursor_json FROM connectors WHERE id='discord'").get() as { cursor_json: string } | undefined;
  try { return asRecord(JSON.parse(row?.cursor_json ?? "{}")); } catch { return {}; }
}

export async function syncDiscord(db: Database.Database) {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) throw new Error("Discord bot token is not configured");
  const targets = configuredChannels(db);
  const cursors = cursorState(db);
  let seen = 0;
  let changed = 0;

  const fetchMessages = async (channelId: string, parameter?: { key: "after" | "before"; value: string }) => {
    const url = new URL(`channels/${channelId}/messages`, "https://discord.com/api/v10/");
    url.searchParams.set("limit", "100");
    if (parameter) url.searchParams.set(parameter.key, parameter.value);
    const response = await fetch(url, {
      headers: { Authorization: `Bot ${token}`, Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Discord API returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Discord returned an unexpected messages response");
    return payload.map(asRecord);
  };

  for (const target of targets) {
    const existingCursor = typeof cursors[target.channelId] === "string" ? String(cursors[target.channelId]) : null;
    let newest = existingCursor;
    const messages: Json[] = [];
    if (existingCursor) {
      let after = existingCursor;
      for (let page = 0; page < 50; page++) {
        const batch = await fetchMessages(target.channelId, { key: "after", value: after });
        if (batch.length === 0) break;
        messages.push(...batch);
        const batchNewest = batch.map((message) => String(message.id ?? "")).filter(Boolean)
          .reduce((max, value) => greaterSnowflake(value, max) ? value : max, after);
        if (batchNewest === after) break;
        after = batchNewest;
        if (batch.length < 100) break;
      }
    } else {
      let before: string | undefined;
      for (let page = 0; page < 50; page++) {
        const batch = await fetchMessages(target.channelId, before ? { key: "before", value: before } : undefined);
        if (batch.length === 0) break;
        messages.push(...batch);
        const ids = batch.map((message) => String(message.id ?? "")).filter(Boolean);
        before = ids.reduce((min, value) => greaterSnowflake(min, value) ? value : min, ids[0]);
        if (batch.length < 100) break;
      }
    }

    for (const message of messages) {
      const messageId = typeof message.id === "string" ? message.id : "";
      const content = messageText(message);
      if (!messageId || !content) continue;
      if (!newest || greaterSnowflake(messageId, newest)) newest = messageId;
      const result = upsertSource(db, {
        courseId: target.courseId, provider: "discord",
        externalId: `course:${target.courseId}:channel:${target.channelId}:message:${messageId}`,
        kind: "student-message", title: `Course discussion · ${new Date(String(message.timestamp ?? Date.now())).toLocaleString()}`,
        url: null, content, privacyClass: "student_discussion", authorityRank: 60,
        updatedAt: typeof message.edited_timestamp === "string" ? message.edited_timestamp
          : typeof message.timestamp === "string" ? message.timestamp : undefined,
        metadata: { channelId: target.channelId, messageId, hasAttachments: Array.isArray(message.attachments) && message.attachments.length > 0 },
      });
      seen++; if (result.changed) changed++;
    }
    if (newest) cursors[target.channelId] = newest;
  }

  db.prepare("UPDATE connectors SET cursor_json=? WHERE id='discord'").run(JSON.stringify(cursors));
  return { seen, changed, channels: targets.length };
}
