import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import Link from "next/link";
import type { StudyCourse } from "@/lib/studyHubManifest";

const NOTES_REPOSITORY =
  "https://github.com/SonNguyen2914/study-hub-notes";

type StudyHubPageProps = {
  semester: string;
  courses: StudyCourse[];
};

export const getServerSideProps = (async () => {
  // Keep the manifest server-owned. Only the fields needed to draw the
  // dashboard are deliberately serialized into the page response.
  const { studyHubManifest } = await import("@/lib/studyHubManifest");

  return {
    props: {
      semester: studyHubManifest.semester,
      courses: [...studyHubManifest.courses],
    },
  };
}) satisfies GetServerSideProps<StudyHubPageProps>;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ResourceCard({
  index,
  label,
  title,
  description,
  status,
  href,
}: {
  index: string;
  label: string;
  title: string;
  description: string;
  status: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-faint">
          {index}
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">
          {status}
        </span>
      </div>
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
        {label}
      </p>
      <h3 className="mt-3 text-xl font-medium tracking-[-0.03em] text-ink-hi">
        {title}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-ink-mid">
        {description}
      </p>
      {href && (
        <span className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-hi">
          Open repository <Arrow />
        </span>
      )}
    </>
  );

  const className =
    "group min-h-72 rounded-2xl border border-line bg-elev p-6 " +
    "transition-colors hover:border-line-strong sm:p-7";

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {content}
    </a>
  ) : (
    <article className={className}>{content}</article>
  );
}
function courseNotesUrl(notesPath: string) {
  const encodedPath = notesPath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `${NOTES_REPOSITORY}/tree/main/${encodedPath}`;
}

function CourseCard({ course }: { course: StudyCourse }) {
  return (
    <article className="rounded-2xl border border-line bg-elev p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {course.semester}
          </p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-ink-hi">
            {course.title}
          </h3>
        </div>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low">
          Active
        </span>
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-3">
        <a
          href={course.googleDriveUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-line px-3 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid transition-colors hover:border-line-strong hover:text-ink-hi"
        >
          Drive <Arrow />
        </a>
        <a
          href={course.notebookLmUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-line px-3 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid transition-colors hover:border-line-strong hover:text-ink-hi"
        >
          NotebookLM <Arrow />
        </a>
        <a
          href={courseNotesUrl(course.notesPath)}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-line px-3 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mid transition-colors hover:border-line-strong hover:text-ink-hi"
        >
          Notes <Arrow />
        </a>
      </div>
    </article>
  );
}

export default function StudyHub({
  semester,
  courses,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Study Hub — namson.dev</title>
        <meta
          name="description"
          content="A private launchpad for course sources, study workspaces, and reviewed notes."
        />
      </Head>

      <div className="min-h-screen bg-bs text-ink-mid">
        <header className="sticky top-0 z-50 border-b border-line bg-bs/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-5 sm:px-8">
            <Link
              href="/study-hub"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-hi"
            >
              Study Hub
            </Link>
            <span className="hidden h-3 w-px bg-line-strong sm:block" />
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint sm:block">
              Personal workspace
            </span>
            <nav className="ml-auto flex items-center gap-1.5" aria-label="Study Hub">
              <a
                href="#courses"
                className="rounded-md px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:text-ink-hi"
              >
                Courses
              </a>
              <a
                href="#resources"
                className="rounded-md px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:text-ink-hi"
              >
                System
              </a>
              <Link
                href="/bet-suggester"
                className="hidden rounded-md border border-line px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi sm:block"
              >
                Match lab
              </Link>
            </nav>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-line">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(42rem 24rem at 72% 10%, rgba(245,197,66,0.09), transparent 70%)",
              }}
            />
            <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
              <div className="grid gap-14 lg:grid-cols-[1fr_17rem] lg:items-end">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                    {semester} · Read-only dashboard
                  </p>
                  <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.065em] text-ink-hi sm:text-7xl lg:text-[5.5rem]">
                    One quiet place to begin.
                  </h1>
                  <p className="mt-7 max-w-2xl text-base leading-7 text-ink-mid sm:text-lg sm:leading-8">
                    Course sources, focused study workspaces, and reviewed notes—connected without mixing what belongs where.
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                  <div className="bg-bs p-5">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                      Courses
                    </dt>
                    <dd className="mt-3 text-3xl font-medium tracking-[-0.04em] text-ink-hi">
                      {String(courses.length).padStart(2, "0")}
                    </dd>
                  </div>
                  <div className="bg-bs p-5">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                      Mode
                    </dt>
                    <dd className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-up">
                      Curated
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section
            id="courses"
            className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24"
          >
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  01 · Courses
                </p>
                <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-ink-hi sm:text-4xl">
                  {semester}
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-ink-low">
                Confirmed courses appear here with one path to each source, workspace, and notes folder.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-line-strong bg-elev/40 px-6 py-16 text-center sm:px-10 sm:py-20">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-elev font-mono text-lg text-accent">
                    +
                  </span>
                  <h3 className="mt-6 text-2xl font-medium tracking-[-0.035em] text-ink-hi">
                    Course list pending
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-mid">
                    Nothing is missing or guessed. Your first course will appear here after the Fall 2026 schedule and resource links are confirmed.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section id="resources" className="scroll-mt-20 border-t border-line bg-elev/30">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  02 · Knowledge system
                </p>
                <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] text-ink-hi sm:text-4xl">
                  A place for every kind of work.
                </h2>
                <p className="mt-5 text-sm leading-6 text-ink-mid sm:text-base sm:leading-7">
                  Source files stay separate from exploration and permanent knowledge, so an AI draft never quietly becomes a fact.
                </p>
              </div>

              <div className="mt-12 grid gap-4 lg:grid-cols-3">
                <ResourceCard
                  index="01"
                  label="Source"
                  title="Google Drive"
                  description="Professor-provided files remain in their original, access-controlled home. Course cards link out to them."
                  status="Per course"
                />
                <ResourceCard
                  index="02"
                  label="Explore"
                  title="NotebookLM"
                  description="A dedicated workspace for asking questions, tracing sources, and developing understanding before notes are finalized."
                  status="Per course"
                />
                <ResourceCard
                  index="03"
                  label="Keep"
                  title="Curated notes"
                  description="Reviewed explanations, study guides, summaries, and flashcards live as Markdown in the private notes repository."
                  status="Private"
                  href={NOTES_REPOSITORY}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                Review AI output before it becomes a permanent note.
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                Live prompting · planned
              </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
