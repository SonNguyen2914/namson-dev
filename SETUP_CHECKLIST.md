# Study Hub owner setup

All application code is ready. The remaining steps grant the local worker access to private systems; only the account owner or a server administrator can do them. Keep every credential in ignored `.env.local` and do not paste it into chat, GitHub, or a browser URL.

## 1. Canvas

1. Sign in to the Canvas account that contains the courses.
2. Open **Account → Settings → Approved Integrations → New Access Token**. Some schools disable personal tokens; in that case ask the Canvas administrator for a read-only developer-key/OAuth integration.
3. Put the school origin, such as `https://school.instructure.com`, in `CANVAS_BASE_URL` and the token in `CANVAS_ACCESS_TOKEN`.
4. Leave `CANVAS_COURSE_IDS` empty to discover all active courses, or add comma-separated numeric IDs from course URLs.
5. Run `npm run study-hub:sync`, then `npm run study-hub:doctor`.

The connector only sends GET requests. Canvas may hide locked items or endpoints that the student role cannot access; the worker does not bypass those controls.

## 2. Google Drive and the NotebookLM bridge

Use the Google account that owns the NotebookLM notebooks, or share the generated Docs with that account before importing them.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. Enable the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) and [Google Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com).
3. Configure **Google Auth Platform** as an External app in testing mode and add your Google account as a test user.
4. Create an OAuth client of type **Desktop app**. Put its client ID and client secret into `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`.
5. Run `npm run study-hub:google-auth`. The browser asks for the narrow `drive.file` scope; the resulting refresh token is written directly to ignored `.env.local`.
6. Leave `GOOGLE_DRIVE_ROOT_FOLDER_ID` empty to let the app create its own **Study Hub** folder, or enter an app-accessible folder ID.
7. Set `GOOGLE_DRIVE_SYNC_ENABLED=true` and run `npm run study-hub:sync` once.
8. Open Drive. In each course folder, import the generated **Study Hub knowledge feed** Google Doc into that course's NotebookLM notebook once. Drive-backed sources refresh from that living Doc; newly archived binary files remain durable originals in Drive.

NotebookLM does not expose a supported consumer API for silently adding arbitrary sources. The one-time Doc import is therefore intentionally manual. NotebookLM's own help describes Drive-source refresh and supported source limits.

## 3. AI provider (optional)

The timeline, source archive, change tracking, and NotebookLM bridge work without this. To enable cited drafts inside the website, choose an HTTPS provider with an OpenAI-compatible `chat/completions` endpoint and fill:

```dotenv
STUDY_HUB_AI_PROVIDER=openai-compatible
STUDY_HUB_AI_BASE_URL=https://provider.example/v1/
STUDY_HUB_AI_MODEL=provider-model-id
STUDY_HUB_AI_API_KEY=secret-from-provider
```

Only excerpts retrieved for the submitted question are sent to that provider. The response stays an unreviewed browser-session draft.

## 4. GitHub

Canvas-discovered public GitHub course repositories work without configuration. For private repositories or higher API limits, create a fine-grained token restricted to the required repositories with read-only **Contents** and **Metadata** access and put it in `GITHUB_READ_TOKEN`.

Repositories that are not linked from Canvas can be assigned explicitly:

```dotenv
STUDY_HUB_GITHUB_REPOSITORIES_JSON=[{"courseSlug":"course-slug","url":"https://github.com/owner/repository"}]
```

## 5. Discord (optional, server-admin action)

1. Create an app in the [Discord Developer Portal](https://discord.com/developers/applications), add a bot, and enable **Message Content Intent**.
2. Ask a server administrator to install it with only **View Channels** and **Read Message History** in the approved course channels. Do not grant Send Messages, Manage Messages, or administrator permission.
3. Put its token in `DISCORD_BOT_TOKEN`.
4. In Discord Developer Mode, copy each channel or thread ID and map it to a course:

```dotenv
STUDY_HUB_DISCORD_CHANNELS_JSON=[{"courseSlug":"course-slug","channelId":"123456789012345678"}]
```

The first run backfills up to 5,000 messages per channel; later runs continue from the newest message. Author identities are not stored. Add thread IDs separately because Discord threads are channels of their own.

Student discussion is excluded from external AI prompts by default. After reviewing your provider's privacy terms, set `STUDY_HUB_INCLUDE_STUDENT_DISCUSSIONS_IN_AI=true` only if you deliberately want de-identified Canvas/Discord discussion included in cited answers.

## 6. Keep it running

After one successful manual sync:

```bash
./scripts/install-study-hub-launchd.sh
```

This builds the production application and installs restartable per-user web and worker services. Open `http://localhost:3125/study-hub`. The worker syncs every 15 minutes and catches up after the Mac restarts or wakes. In macOS settings, prevent automatic sleep while connected to power.

For private access away from home, use Tailscale Serve after the local site is healthy. Do not expose port 3125 through router port forwarding.

## Final verification

```bash
npm run study-hub:doctor
npm run study-hub:sync
tail -f logs/worker.log
```

The dashboard should show Canvas healthy, source/deadline counts, recently changed material, and Drive/Discord health only for the connectors you enabled.

## Quizlet sets

After Canvas sync and AI setup, open a course and use **Quizlet export**. Study Hub creates reviewed, tab-separated cards; choose **Copy cards**, open `quizlet.new`, choose **Import**, and paste. Quizlet then turns the set into its Learn/Test activities or a Practice Test, depending on the account plan. Direct unattended publishing is intentionally avoided because Quizlet does not offer this project a supported account-write API.
