import type Database from "better-sqlite3";
import { load } from "cheerio";
import {
  findOrCreateCanvasCourse,
  markMissingCanvasRecords,
  upsertAcademicEvent,
  upsertSource,
} from "@/server/studyHubDb";

type Json = Record<string, unknown>;

export type CanvasSyncResult = {
  seen: number;
  changed: number;
  courses: number;
  externalLinks: Array<{ courseId: string; courseSlug: string; url: string }>;
};

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Json
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function id(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function iso(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

export function htmlToText(html: string) {
  const $ = load(html);
  $("script,style,noscript,svg").remove();
  return $.root().text().replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

export function extractSafeExternalLinks(html: string) {
  const $ = load(html);
  const links = new Set<string>();
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    try {
      const url = new URL(href);
      if (url.protocol === "https:") links.add(url.href);
    } catch {
      // Relative Canvas links remain represented by their owning source.
    }
  });
  return [...links];
}

function linkNext(header: string | null) {
  if (!header) return null;
  for (const part of header.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match?.[2].split(/\s+/).includes("next")) return match[1];
  }
  return null;
}

function canvasConfig() {
  const base = process.env.CANVAS_BASE_URL?.trim();
  const token = process.env.CANVAS_ACCESS_TOKEN?.trim();
  if (!base || !token) return null;
  const url = new URL(base);
  if (url.protocol !== "https:") throw new Error("CANVAS_BASE_URL must use HTTPS");
  return { baseUrl: new URL(url.href.endsWith("/") ? url.href : `${url.href}/`), token };
}

export function isCanvasConfigured() {
  return Boolean(process.env.CANVAS_BASE_URL?.trim() && process.env.CANVAS_ACCESS_TOKEN?.trim());
}

class CanvasClient {
  constructor(private baseUrl: URL, private token: string) {}

  async pages(pathname: string, parameters: Record<string, string | string[]> = {}) {
    const first = new URL(pathname.replace(/^\//, ""), this.baseUrl);
    for (const [key, value] of Object.entries(parameters)) {
      for (const item of Array.isArray(value) ? value : [value]) first.searchParams.append(key, item);
    }
    const all: unknown[] = [];
    let next: string | null = first.href;
    let page = 0;
    while (next && page++ < 50) {
      const response = await this.request(next);
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) throw new Error("Canvas returned an unexpected list response");
      all.push(...payload);
      next = linkNext(response.headers.get("link"));
    }
    return all;
  }

  async optionalPages(pathname: string, parameters: Record<string, string | string[]> = {}) {
    try { return await this.pages(pathname, parameters); } catch { return []; }
  }

  async get(pathname: string) {
    const url = new URL(pathname.replace(/^\//, ""), this.baseUrl);
    const response = await this.request(url.href);
    return asRecord(await response.json());
  }

  private async request(url: string) {
    const target = new URL(url);
    if (target.origin !== this.baseUrl.origin) throw new Error("Canvas pagination changed origin");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(target, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Canvas API returned ${response.status}`);
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function downloadCanvasAsset(urlValue: string, expectedSize: number | null) {
  const config = canvasConfig();
  if (!config) throw new Error("Canvas is not configured");
  const url = new URL(urlValue);
  if (url.protocol !== "https:") throw new Error("Canvas asset URL must use HTTPS");
  const configuredMax = Number(process.env.STUDY_HUB_MAX_FILE_BYTES || 52_428_800);
  const maxBytes = Number.isFinite(configuredMax) ? Math.max(1_048_576, configuredMax) : 52_428_800;
  if (expectedSize !== null && expectedSize > maxBytes) throw new Error("Canvas asset exceeds the archive size limit");
  const headers: Record<string, string> = {};
  if (url.origin === config.baseUrl.origin) headers.Authorization = `Bearer ${config.token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch(url, { headers, redirect: "follow", signal: controller.signal });
    if (!response.ok) throw new Error(`Canvas asset returned ${response.status}`);
    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new Error("Canvas asset exceeds the archive size limit");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) throw new Error("Canvas asset exceeds the archive size limit");
    return { bytes, contentType: response.headers.get("content-type") || "application/octet-stream" };
  } finally { clearTimeout(timeout); }
}

function collectDiscussionText(topic: Json) {
  const lines: string[] = [];
  const visit = (entry: Json, depth: number) => {
    const message = htmlToText(text(entry.message));
    if (message) lines.push(`${"  ".repeat(Math.min(depth, 4))}- ${message}`);
    const replies = Array.isArray(entry.replies) ? entry.replies : [];
    for (const reply of replies) visit(asRecord(reply), depth + 1);
  };
  const view = Array.isArray(topic.view) ? topic.view : [];
  for (const entry of view) visit(asRecord(entry), 0);
  return lines.join("\n");
}

function externalLinksFrom(content: string, courseId: string, courseSlug: string) {
  return extractSafeExternalLinks(content).map((url) => ({ courseId, courseSlug, url }));
}

export async function syncCanvas(db: Database.Database): Promise<CanvasSyncResult> {
  const config = canvasConfig();
  if (!config) throw new Error("Canvas is not configured");
  const client = new CanvasClient(config.baseUrl, config.token);
  const syncStartedAt = new Date().toISOString();
  const onlyIds = new Set(
    (process.env.CANVAS_COURSE_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean),
  );
  const courses = await client.pages("api/v1/courses", {
    enrollment_state: "active", "state[]": "available", "include[]": ["term", "syllabus_body"], per_page: "100",
  });
  let seen = 0;
  let changed = 0;
  let courseCount = 0;
  const externalLinks: CanvasSyncResult["externalLinks"] = [];

  for (const rawCourse of courses) {
    const course = asRecord(rawCourse);
    const canvasId = id(course.id);
    if (!canvasId || (onlyIds.size > 0 && !onlyIds.has(canvasId))) continue;
    if (course.access_restricted_by_date === true) continue;
    const term = asRecord(course.term);
    const row = findOrCreateCanvasCourse(db, {
      id: canvasId,
      name: text(course.name) || text(course.course_code) || `Canvas course ${canvasId}`,
      courseCode: text(course.course_code),
      semester: text(term.name) || "Current term",
    });
    courseCount++;
    const courseUrl = new URL(`courses/${encodeURIComponent(canvasId)}`, config.baseUrl).href;
    const syllabusHtml = text(course.syllabus_body);
    if (syllabusHtml) {
      const result = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:syllabus`, kind: "syllabus",
        title: `${row.title} syllabus`, url: courseUrl, content: htmlToText(syllabusHtml), authorityRank: 10,
        metadata: { canvasCourseId: canvasId },
      });
      seen++; if (result.changed) changed++;
      externalLinks.push(...externalLinksFrom(syllabusHtml, row.id, row.slug));
    }

    const [modules, assignments, pages, discussions, files, announcements, quizzes, submissions, calendarEvents] = await Promise.all([
      client.pages(`api/v1/courses/${canvasId}/modules`, { "include[]": "items", per_page: "100" }),
      client.pages(`api/v1/courses/${canvasId}/assignments`, { order_by: "due_at", per_page: "100" }),
      client.pages(`api/v1/courses/${canvasId}/pages`, { sort: "updated_at", order: "desc", per_page: "100" }),
      client.pages(`api/v1/courses/${canvasId}/discussion_topics`, { order_by: "recent_activity", per_page: "100" }),
      client.pages(`api/v1/courses/${canvasId}/files`, { sort: "updated_at", order: "desc", per_page: "100" }),
      client.pages("api/v1/announcements", {
        "context_codes[]": `course_${canvasId}`,
        start_date: new Date(Date.now() - 365 * 86_400_000).toISOString(),
        end_date: new Date(Date.now() + 365 * 86_400_000).toISOString(), per_page: "100",
      }),
      client.optionalPages(`api/v1/courses/${canvasId}/quizzes`, { per_page: "100" }),
      client.optionalPages(`api/v1/courses/${canvasId}/students/submissions`, {
        "student_ids[]": "self", "include[]": ["submission_comments", "rubric_assessment"], per_page: "100",
      }),
      client.optionalPages("api/v1/calendar_events", {
        "context_codes[]": `course_${canvasId}`, type: "event",
        start_date: new Date(Date.now() - 365 * 86_400_000).toISOString(),
        end_date: new Date(Date.now() + 365 * 86_400_000).toISOString(), per_page: "100",
      }),
    ]);

    for (const raw of modules) {
      const courseModule = asRecord(raw);
      const moduleId = id(courseModule.id);
      const items = Array.isArray(courseModule.items) ? courseModule.items.map(asRecord) : [];
      const content = items.map((item) => {
        const due = iso(item.due_at);
        return `- ${text(item.type)}: ${text(item.title)}${due ? ` (due ${due})` : ""}${text(item.html_url) ? ` — ${text(item.html_url)}` : ""}`;
      }).join("\n");
      const result = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:module:${moduleId}`,
        kind: "module", title: text(courseModule.name) || `Module ${moduleId}`, url: text(courseModule.items_url) || courseUrl,
        content, authorityRank: 15, metadata: { position: courseModule.position, state: courseModule.state },
      });
      seen++; if (result.changed) changed++;
      for (const item of items) {
        const dueAt = iso(item.due_at);
        if (!dueAt) continue;
        const event = upsertAcademicEvent(db, {
          courseId: row.id, sourceId: result.id, provider: "canvas",
          externalId: `course:${canvasId}:module-item:${id(item.id)}`, kind: text(item.type).toLowerCase() || "module-item",
          title: text(item.title), dueAt, url: text(item.html_url) || null, authorityRank: 15,
        });
        seen++; if (event.changed) changed++;
      }
    }

    for (const raw of assignments) {
      const assignment = asRecord(raw);
      const assignmentId = id(assignment.id);
      const html = text(assignment.description);
      const rubric = Array.isArray(assignment.rubric) ? assignment.rubric.map((rawCriterion) => {
        const criterion = asRecord(rawCriterion);
        return `- ${text(criterion.description)}${text(criterion.long_description) ? `: ${htmlToText(text(criterion.long_description))}` : ""}`;
      }).join("\n") : "";
      const content = [htmlToText(html), rubric && `Rubric:\n${rubric}`, text(assignment.grading_type) && `Grading: ${text(assignment.grading_type)}`,
        typeof assignment.points_possible === "number" && `Points: ${assignment.points_possible}`].filter(Boolean).join("\n\n");
      const source = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:assignment:${assignmentId}`,
        kind: "assignment", title: text(assignment.name) || `Assignment ${assignmentId}`,
        url: text(assignment.html_url) || courseUrl, content, authorityRank: 10,
        updatedAt: iso(assignment.updated_at) ?? undefined,
        metadata: { pointsPossible: assignment.points_possible, submissionTypes: assignment.submission_types, published: assignment.published },
      });
      seen++; if (source.changed) changed++;
      const event = upsertAcademicEvent(db, {
        courseId: row.id, sourceId: source.id, provider: "canvas", externalId: `course:${canvasId}:assignment:${assignmentId}`,
        kind: "assignment", title: text(assignment.name), description: htmlToText(html).slice(0, 1_000),
        dueAt: iso(assignment.due_at), startsAt: iso(assignment.unlock_at),
        status: assignment.published === false ? "unpublished" : "active", url: text(assignment.html_url) || null,
        authorityRank: 10, updatedAt: iso(assignment.updated_at) ?? undefined,
        metadata: { lockAt: iso(assignment.lock_at), pointsPossible: assignment.points_possible },
      });
      seen++; if (event.changed) changed++;
      externalLinks.push(...externalLinksFrom(html, row.id, row.slug));
    }

    for (const raw of pages) {
      const page = asRecord(raw);
      const pageSlug = text(page.url);
      if (!pageSlug) continue;
      const detail = await client.get(`api/v1/courses/${canvasId}/pages/${encodeURIComponent(pageSlug)}`);
      const html = text(detail.body);
      const result = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:page:${pageSlug}`,
        kind: "page", title: text(detail.title) || pageSlug, url: text(detail.html_url) || courseUrl,
        content: htmlToText(html), authorityRank: 15, updatedAt: iso(detail.updated_at) ?? undefined,
        metadata: { published: detail.published, frontPage: detail.front_page },
      });
      seen++; if (result.changed) changed++;
      externalLinks.push(...externalLinksFrom(html, row.id, row.slug));
    }

    for (const raw of announcements) {
      const announcement = asRecord(raw);
      const announcementId = id(announcement.id);
      const html = text(announcement.message);
      const source = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:announcement:${announcementId}`,
        kind: "announcement", title: text(announcement.title) || `Announcement ${announcementId}`,
        url: text(announcement.html_url) || courseUrl, content: htmlToText(html), authorityRank: 5,
        updatedAt: iso(announcement.posted_at) ?? undefined,
      });
      seen++; if (source.changed) changed++;
      const event = upsertAcademicEvent(db, {
        courseId: row.id, sourceId: source.id, provider: "canvas",
        externalId: `course:${canvasId}:announcement:${announcementId}`, kind: "announcement",
        title: text(announcement.title), description: htmlToText(html).slice(0, 1_000),
        startsAt: iso(announcement.posted_at), url: text(announcement.html_url) || null, authorityRank: 5,
        updatedAt: iso(announcement.last_reply_at) ?? iso(announcement.posted_at) ?? undefined,
      });
      seen++; if (event.changed) changed++;
      externalLinks.push(...externalLinksFrom(html, row.id, row.slug));
    }

    for (const raw of discussions) {
      const discussion = asRecord(raw);
      const discussionId = id(discussion.id);
      let entries = "";
      try {
        entries = collectDiscussionText(await client.get(`api/v1/courses/${canvasId}/discussion_topics/${discussionId}/view`));
      } catch {
        // Some graded/locked discussions expose metadata but not replies.
      }
      const html = text(discussion.message);
      const content = [htmlToText(html), entries && `Student discussion (names removed):\n${entries}`].filter(Boolean).join("\n\n");
      const result = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:discussion:${discussionId}`,
        kind: "discussion", title: text(discussion.title) || `Discussion ${discussionId}`,
        url: text(discussion.html_url) || courseUrl, content,
        privacyClass: entries ? "student_discussion" : "course_material", authorityRank: 40,
        updatedAt: iso(discussion.last_reply_at) ?? iso(discussion.posted_at) ?? undefined,
        metadata: { discussionType: discussion.discussion_type, locked: discussion.locked },
      });
      seen++; if (result.changed) changed++;
      externalLinks.push(...externalLinksFrom(html, row.id, row.slug));
    }

    for (const raw of files) {
      const file = asRecord(raw);
      const fileId = id(file.id);
      const content = [text(file.display_name), text(file.content_type),
        typeof file.size === "number" && `Size: ${file.size} bytes`,
        iso(file.updated_at) && `Updated: ${iso(file.updated_at)}`].filter(Boolean).join("\n");
      const result = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:file:${fileId}`,
        kind: "file", title: text(file.display_name) || text(file.filename) || `File ${fileId}`,
        url: text(file.url) || courseUrl, content, authorityRank: 15,
        updatedAt: iso(file.updated_at) ?? iso(file.created_at) ?? undefined,
        metadata: { filename: file.filename, contentType: file.content_type, size: file.size, locked: file.locked, downloadUrl: file.url },
      });
      seen++; if (result.changed) changed++;
    }

    for (const raw of quizzes) {
      const quiz = asRecord(raw);
      const quizId = id(quiz.id);
      const html = text(quiz.description);
      const source = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:quiz:${quizId}`,
        kind: "quiz", title: text(quiz.title) || `Quiz ${quizId}`, url: text(quiz.html_url) || courseUrl,
        content: htmlToText(html), authorityRank: 10, updatedAt: iso(quiz.updated_at) ?? undefined,
        metadata: { quizType: quiz.quiz_type, pointsPossible: quiz.points_possible, questionCount: quiz.question_count, published: quiz.published },
      });
      seen++; if (source.changed) changed++;
      const event = upsertAcademicEvent(db, {
        courseId: row.id, sourceId: source.id, provider: "canvas", externalId: `course:${canvasId}:quiz:${quizId}`,
        kind: "quiz", title: text(quiz.title), description: htmlToText(html).slice(0, 1_000),
        dueAt: iso(quiz.due_at), startsAt: iso(quiz.unlock_at), status: quiz.published === false ? "unpublished" : "active",
        url: text(quiz.html_url) || null, authorityRank: 10, updatedAt: iso(quiz.updated_at) ?? undefined,
        metadata: { lockAt: iso(quiz.lock_at), timeLimit: quiz.time_limit, allowedAttempts: quiz.allowed_attempts },
      });
      seen++; if (event.changed) changed++;
      externalLinks.push(...externalLinksFrom(html, row.id, row.slug));
    }

    for (const raw of submissions) {
      const submission = asRecord(raw);
      const assignmentId = id(submission.assignment_id);
      if (!assignmentId) continue;
      const comments = Array.isArray(submission.submission_comments)
        ? submission.submission_comments.map((rawComment) => htmlToText(text(asRecord(rawComment).comment))).filter(Boolean)
        : [];
      const content = [
        `Workflow: ${text(submission.workflow_state) || "unknown"}`,
        iso(submission.submitted_at) && `Submitted: ${iso(submission.submitted_at)}`,
        submission.late === true && "Marked late", submission.missing === true && "Marked missing",
        comments.length > 0 && `Submission comments (names removed):\n${comments.map((comment) => `- ${comment}`).join("\n")}`,
      ].filter(Boolean).join("\n");
      const result = upsertSource(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:submission:${assignmentId}`,
        kind: "submission-status", title: `Submission status · assignment ${assignmentId}`,
        url: text(submission.preview_url) || courseUrl, content,
        privacyClass: "student_discussion", authorityRank: 20,
        updatedAt: iso(submission.graded_at) ?? iso(submission.submitted_at) ?? undefined,
        metadata: { assignmentId, workflowState: submission.workflow_state, score: submission.score, grade: submission.grade },
      });
      seen++; if (result.changed) changed++;
    }

    for (const raw of calendarEvents) {
      const calendar = asRecord(raw);
      const eventId = id(calendar.id);
      const event = upsertAcademicEvent(db, {
        courseId: row.id, provider: "canvas", externalId: `course:${canvasId}:calendar:${eventId}`,
        kind: "calendar", title: text(calendar.title) || `Calendar event ${eventId}`,
        description: htmlToText(text(calendar.description)).slice(0, 1_000), startsAt: iso(calendar.start_at),
        dueAt: iso(calendar.start_at), url: text(calendar.html_url) || null, authorityRank: 10,
        updatedAt: iso(calendar.updated_at) ?? undefined, metadata: { endAt: iso(calendar.end_at), allDay: calendar.all_day },
      });
      seen++; if (event.changed) changed++;
    }

    const missing = markMissingCanvasRecords(db, row.id, canvasId, syncStartedAt);
    changed += missing.sources + missing.events;
  }

  return { seen, changed, courses: courseCount, externalLinks };
}
