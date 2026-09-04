# Academic Agent

Study Hub is a local-first, read-only academic operations system. A production Next.js service renders the private dashboard while a separate worker polls permitted sources, keeps a versioned SQLite record, extracts deadlines, follows approved GitHub repositories, refreshes a Google Drive knowledge document, and supplies cited local context to the configured AI provider.

## Safety contract

- Canvas, GitHub, and Discord connectors are read-only. The system does not submit assignments, take quizzes, post, message, react, impersonate the student, unlock content, or execute downloaded code.
- Official Canvas announcements and assignments outrank syllabus/instructor pages, instructor GitHub sources, student discussion, and AI inference in that order. Conflicts stay visible for review.
- Raw student discussion is stored locally with author names and platform mentions removed. It is excluded from Google Drive, NotebookLM documents, and external AI retrieval unless the owner explicitly enables the student-discussion AI switch.
- Every ingested source is hashed and versioned. Nothing is automatically deleted when upstream content disappears.
- Google Drive writes require `GOOGLE_DRIVE_SYNC_ENABLED=true`; without that explicit switch the connector remains inert.
- Credentials remain in ignored `.env.local`, never in browser bundles, Git, URLs, or routine logs.
- AI output is always an unreviewed draft. Retrieval excerpts are treated as untrusted data and source links are returned with the answer.

## Implemented data flow

1. Canvas polling discovers active courses and ingests syllabus HTML, modules/items, assignments/rubrics, quizzes, pages, announcements, discussion topics/replies, the student's submission status/comments, calendar items, and file metadata. Deadlines become normalized timeline events.
2. Safe HTTPS links are extracted. GitHub repository links are read through GitHub's APIs, with text/code files capped by count and size; code is never executed.
3. Changed source bodies create immutable versions and refresh the SQLite full-text index.
4. The Google connector excludes student discussions and replaces one generated knowledge document per course. Import that document into the corresponding consumer NotebookLM notebook once; Drive-backed NotebookLM sources then refresh from the same living document.
5. The prompt API retrieves matching excerpts from the local index, labels them `S1…Sn`, and returns their original links beside the AI draft.
6. An approved Discord bot polls configured course channels/threads, backfills up to 5,000 messages at a time, and stores name-free messages locally. They never enter the Drive/NotebookLM feed.
7. The dashboard shows upcoming deadlines, recent material, indexed counts, and connector health.
8. Each course can generate a reviewed, tab-separated Quizlet flashcard set from indexed sources. Quizlet publishing remains a supported one-time website import because no public Study Hub write API is available.

Consumer NotebookLM has no supported source-management API. The living Google Doc is therefore the supported bridge; the system cannot silently add arbitrary new NotebookLM sources or control the NotebookLM interface.

## Continuous local operation

The worker runs immediately and then every 15 minutes by default. A database lease prevents overlapping manual and scheduled runs and automatically recovers if the owning process dies. SQLite uses WAL, foreign keys, a busy timeout, source versions, sync runs, and connector status. After a successful run, the worker creates one online SQLite backup per day under ignored `.data/backups/`. `launchd` restarts both the production website and worker after failure/login. A sync on startup catches changes missed while the Mac was offline.

Commands:

```bash
npm run study-hub:doctor
npm run study-hub:sync
npm run study-hub:backup
npm run study-hub:worker
./scripts/install-study-hub-launchd.sh
```

Before installing services, run the doctor and a one-time sync. The installer builds production, installs two per-user launch agents, and serves only on `localhost:3125`. For private remote access, install Tailscale separately and use Tailscale Serve; do not forward port 3125 from the router.

Back up `.data/study-hub.sqlite` after stopping the worker or with SQLite's online backup command. The database and logs are ignored by Git.

## Current connector coverage and next safe extensions

- Canvas file metadata is indexed and changed files up to 50 MiB are archived into the course Drive folder when Drive sync is enabled. Recording transcription still needs the real Canvas tenant because media providers and caption access vary by school.
- Calendar export can be added after Google OAuth is working; no calendar writes are attempted now.
- Discord uses an approved bot installed by a server administrator with only View Channel and Read Message History permissions. User-account self-bots are prohibited. Add every relevant channel and thread explicitly; the connector performs no write action.
- Automatic notes/flashcards and notification delivery should be generated into a review queue before any permanent write or outbound notification.
