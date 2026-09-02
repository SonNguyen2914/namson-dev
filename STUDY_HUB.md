# Personal Study Hub Setup

This document records the confirmed starting point and the initial integration boundaries for adding the Personal Study Hub to `namson-dev`. It is a setup record, not an implementation specification.

## Confirmed application baseline

- The application uses Next.js 16.2.10 with the Pages Router, React 19.2.4, and TypeScript 5 in strict mode.
- Styling uses Tailwind CSS 4 through PostCSS, with Geist and Archivo font packages.
- npm is the selected package manager and `package-lock.json` is the committed lockfile.
- The repository does not pin Node.js in an engine or version file. GitHub Actions uses Node.js 20; Next.js 16.2.10 requires Node.js 20.9.0 or newer.
- Browser-facing pages and components live under `src/pages` and `src/components`.
- Server-side Next.js API routes live under `src/pages/api`. The existing bet-suggester routes proxy requests to a separate backend.
- `SUGGESTER_BACKEND_URL` is the only application-specific runtime environment variable referenced by the current source. It is read on the server and defaults to `http://localhost:8000`; Playwright separately defaults it to the deployed read-only shadow backend.
- No database client, schema, migration system, or authentication provider is present in this repository.
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

## Version 1 integration boundaries

- **Google Drive** remains the source of professor-provided materials. The application should link to those materials rather than copy them into either Git repository.
- **`study-hub-notes`** is the private, curated Markdown knowledge store. Only reviewed notes and study outputs belong there.
- **NotebookLM** remains the dedicated study workspace. Version 1 should expose course-specific external links to NotebookLM rather than attempt an undocumented direct integration.
- **Live prompting** should use a provider-neutral server-side interface so the UI is not coupled to one model vendor.
- **API credentials** must be read and used only on the server. They must never be exposed through `NEXT_PUBLIC_` variables, client bundles, source control, or logs.
- **Retrieval scope** stays deliberately small: Version 1 will not add a vector database or a full retrieval-augmented generation system.

## Configuration still to be decided

No Study Hub environment-variable names are confirmed yet. Define them only when an implementation selects a concrete server-side provider or integration, document names without values, and keep local values in ignored environment files and deployment secrets.

External access eventually required for implementation will include the relevant Google account and Drive permissions, access to the private `study-hub-notes` repository, course-specific NotebookLM links, and credentials for the selected live-prompting provider. Secret values should be entered only in the provider or deployment secret manager, never in documentation or chat transcripts.

## Recommended first implementation slice

Build a read-only Study Hub dashboard shell backed by a typed server-side course manifest. Start with course title, semester, Google Drive link, NotebookLM link, and notes-repository path; add no AI call or content ingestion until that navigation and boundary model is reviewed.
