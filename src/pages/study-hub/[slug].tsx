import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { StudyHubAccessGate, StudyHubLogoutButton } from "@/components/StudyHubAccess";
import { StudyPrompt } from "@/components/StudyPrompt";
import type { StudyCourse } from "@/lib/studyHubManifest";

type LockedProps = {
  access: "locked" | "unconfigured";
  course: null;
  promptingConfigured: false;
};

type AuthorizedProps = {
  access: "authorized";
  course: StudyCourse;
  promptingConfigured: boolean;
};

type CoursePageProps = LockedProps | AuthorizedProps;

const NOTES_REPOSITORY =
  "https://github.com/SonNguyen2914/study-hub-notes";

function courseNotesUrl(notesPath: string) {
  const encodedPath = notesPath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `${NOTES_REPOSITORY}/tree/main/${encodedPath}`;
}

export const getServerSideProps = (async ({ params, req, res }) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  const { getStudyHubAuthConfiguration, isStudyHubSessionValid } =
    await import("@/server/studyHubAuth");
  const auth = getStudyHubAuthConfiguration();
  if (!auth.configured) {
    return {
      props: {
        access: "unconfigured",
        course: null,
        promptingConfigured: false,
      },
    };
  }
  if (!isStudyHubSessionValid(req.headers.cookie)) {
    return {
      props: {
        access: "locked",
        course: null,
        promptingConfigured: false,
      },
    };
  }

  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { assertValidStudyHubManifest, studyHubManifest } =
    await import("@/lib/studyHubManifest");
  assertValidStudyHubManifest(studyHubManifest);
  const course = studyHubManifest.courses.find(
    (candidate) => candidate.slug === slug,
  );
  if (!course) return { notFound: true };

  const { getStudyPromptProviderStatus } =
    await import("@/server/studyHubProvider");
  return {
    props: {
      access: "authorized",
      course,
      promptingConfigured: getStudyPromptProviderStatus().configured,
    },
  };
}) satisfies GetServerSideProps<CoursePageProps>;

function ResourceLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-line bg-elev p-5 transition-colors hover:border-line-strong"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        {label} ↗
      </span>
      <span className="mt-3 block text-sm leading-6 text-ink-mid">
        {description}
      </span>
    </a>
  );
}

export default function CourseWorkspace(props: CoursePageProps) {
  if (props.access !== "authorized") {
    return (
      <>
        <Head>
          <title>Study Hub access — namson.dev</title>
          <meta name="robots" content="noindex,nofollow,noarchive" />
        </Head>
        <StudyHubAccessGate configured={props.access === "locked"} />
      </>
    );
  }

  const { course, promptingConfigured } = props;
  return (
    <>
      <Head>
        <title>{`${course.title} — Study Hub`}</title>
        <meta
          name="description"
          content={`Private study workspace for ${course.title}.`}
        />
        <meta name="robots" content="noindex,nofollow,noarchive" />
      </Head>

      <div className="min-h-screen bg-bs text-ink-mid">
        <header className="sticky top-0 z-50 border-b border-line bg-bs/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-5 sm:px-8">
            <Link
              href="/study-hub"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low transition-colors hover:text-ink-hi"
            >
              ← All courses
            </Link>
            <span className="ml-auto truncate font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
              {course.title}
            </span>
            <StudyHubLogoutButton />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            {course.semester} · Course workspace
          </p>
          <h1 className="mt-5 text-5xl font-medium tracking-[-0.06em] text-ink-hi sm:text-7xl">
            {course.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink-mid">
            Start from the source, explore deliberately, and keep only what has been reviewed in your own words.
          </p>

          <section className="mt-12 grid gap-3 sm:grid-cols-3" aria-label="Course resources">
            <ResourceLink
              href={course.googleDriveUrl}
              label="Google Drive"
              description="Professor-provided source materials"
            />
            <ResourceLink
              href={course.notebookLmUrl}
              label="NotebookLM"
              description="Source-grounded study workspace"
            />
            <ResourceLink
              href={courseNotesUrl(course.notesPath)}
              label="Curated notes"
              description="Reviewed Markdown knowledge"
            />
          </section>

          <div className="mt-12">
            <StudyPrompt
              courseSlug={course.slug}
              configured={promptingConfigured}
            />
          </div>
        </main>
      </div>
    </>
  );
}
