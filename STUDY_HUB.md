# Personal Study Hub Setup

The persistent Academic Agent is now implemented. See [ACADEMIC_AGENT.md](./ACADEMIC_AGENT.md) for its architecture and safety contract, then follow [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for the account-owner steps. This file retains the original application baseline and private course-manifest format.

This document records the application baseline, integration boundaries, and the steps for adding course resources without committing private materials.

## Confirmed application baseline

- The application uses Next.js 16.3.4 with the Pages Router, React 19.2.4, and TypeScript 5 in strict mode.
- Styling uses Tailwind CSS 4 through PostCSS, with Geist and Archivo font packages.
- npm is the selected package manager and `package-lock.json` is the committed lockfile.
- The repository does not pin Node.js in an engine or version file. GitHub Actions uses Node.js 20; Next.js 16 requires Node.js 20.9.0 or newer.
- Browser-facing pages and components live under `src/pages` and `src/components`.
- Server-side Next.js API routes live under `src/pages/api`. The existing bet-suggester routes proxy requests to a separate backend.
- The existing bet-suggester reads `SUGGESTER_BACKEND_URL` on the server and defaults to `http://localhost:8000`; Playwright separately defaults it to the deployed read-only shadow backend.
- No database client, schema, migration system, or third-party authentication provider is present. Study Hub uses a small single-user, signed-cookie access gate with secrets supplied by the server environment.
- Vercel deploys the site from pushes to `main`. Non-default branches receive preview builds.

## Existing commands

```bash
npm run dev          # Next.js development server
npx tsc --noEmit     # Type check
npm run lint         # ESLint
npm run build        # Production build
npm run test:e2e     # Playwright end-to-end suite
npm run start        # Serve a production build
```

The Playwright configuration serves the production build on port 3123 by default. Most end-to-end tests depend on `SUGGESTER_BACKEND_URL`; the repository instructions explain how to point them at a local backend when one is available.

## Integration boundaries

- **Google Drive** is the recommended durable archive for professor-provided materials, but it is optional when a course's sources are loaded directly into NotebookLM. The application links to Drive when present rather than copying materials into either Git repository.
- **`study-hub-notes`** is the private, curated Markdown knowledge store. Only reviewed notes and study outputs belong there.
- **NotebookLM** remains the dedicated study workspace. Consumer NotebookLM has no supported source-management API, so one generated Google Doc per course is the supported refresh bridge and importing that Doc once remains manual.
- **Live prompting** should use a provider-neutral server-side interface so the UI is not coupled to one model vendor.
- **API credentials** must be read and used only on the server. They must never be exposed through `NEXT_PUBLIC_` variables, client bundles, source control, or logs.
- **Retrieval scope** uses local SQLite full-text search and returns the exact indexed sources used for each AI draft. No course content is sent unless it matches a user prompt.

## Implemented application

- `/study-hub` is a server-rendered dashboard. It remains safely previewable while the course manifest is empty.
- `src/lib/studyHubManifest.ts` parses and validates the server-only course catalog. Every configured course has a title, semester, NotebookLM URL, and private-notes path; its Google Drive URL may be `null`. Private URLs are never stored in this public repository.
- `/study-hub/[slug]` is the protected course workspace with resource links and a live-prompt draft interface.
- The access gate uses an HTTP-only, same-site, signed cookie. Course links fail closed when access secrets are absent, and login attempts are rate-limited.
- `/api/study-hub/prompt` validates the session, origin, rate, course, and prompt length before calling a server-only provider adapter.
- The first provider adapter supports an OpenAI-compatible chat-completions endpoint. The UI and API contract do not depend on a named vendor, so another adapter can replace it later.
- Prompt responses stay in browser memory, are labelled as unreviewed drafts, and are never written into notes automatically.
- A separate local worker ingests Canvas and approved GitHub sources into versioned SQLite storage, extracts deadlines, updates an opt-in Google Drive knowledge document, and grounds prompts with cited excerpts.

## Server configuration

Copy `.env.example` to an ignored `.env.local` for local development, or add the same names to the Vercel deployment secret manager. Never commit or paste their values into documentation.

| Variable | Required | Purpose |
| --- | --- | --- |
| `STUDY_HUB_ACCESS_PASSWORD` | Before adding courses | Single-user access phrase; minimum 12 characters |
| `STUDY_HUB_SESSION_SECRET` | Before adding courses | Signs 12-hour sessions; minimum 32 random characters |
| `STUDY_HUB_COURSES_JSON` | To add courses | Server-only JSON catalog containing course names and private resource links |
| `STUDY_HUB_AI_PROVIDER` | For live prompting | Set to `openai-compatible` for the included adapter |
| `STUDY_HUB_AI_BASE_URL` | For live prompting | HTTPS base URL for the provider's compatible API |
| `STUDY_HUB_AI_MODEL` | For live prompting | Provider model identifier |
| `STUDY_HUB_AI_API_KEY` | For live prompting | Server-side provider credential |

The access password, session secret, course catalog, and API key are server-only. Do not prefix them with `NEXT_PUBLIC_`. The empty dashboard works without configuration; once the catalog contains a course, missing access configuration produces a locked setup screen instead of serializing private links.

## Add a course after materials are ready

1. Create the course-specific NotebookLM workspace and load its sources.
2. Optionally keep the original professor files in an access-controlled Google Drive folder as a durable archive.
3. In `study-hub-notes`, create a course folder under `fall-2026/` using the existing templates. Commit only curated Markdown output.
4. Store the confirmed catalog as `STUDY_HUB_COURSES_JSON` in `.env.local` and the deployment secret manager. Do not put real links in tracked source files. Its shape is:

```json
{
  "semester": "Fall 2026",
  "courses": [
    {
      "slug": "confirmed-course-slug",
      "title": "Confirmed course title",
      "semester": "Fall 2026",
      "googleDriveUrl": null,
      "notebookLmUrl": "https://notebook.google.com/notebook/...",
      "notesPath": "fall-2026/confirmed-course-slug"
    }
  ]
}
```

5. Run `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `npm run test:e2e` before pushing.

Use `null` for `googleDriveUrl` when materials live only in NotebookLM. When a Drive URL is supplied, the loader requires a supported Google host. NotebookLM links may use Google's current `notebook.google.com` host or its earlier `notebooklm.google.com` host. The loader also rejects malformed JSON, malformed or duplicate slugs, mismatched semesters, unsafe notes paths, and non-HTTPS external links. Course PDFs, textbooks, credentials, private resource URLs, and raw AI transcripts remain outside Git.
