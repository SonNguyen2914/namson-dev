import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

export function StudyHubAccessGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/study-hub/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as
          | { error?: unknown }
          | null;
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Access could not be verified",
        );
      }
      router.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Access failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bs px-5 py-20 text-ink-mid sm:px-8">
      <main className="mx-auto flex min-h-[70vh] max-w-lg items-center">
        <section className="w-full rounded-2xl border border-line bg-elev p-7 sm:p-9">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            Personal Study Hub
          </p>
          <h1 className="mt-5 text-4xl font-medium tracking-[-0.05em] text-ink-hi">
            {configured ? "Private workspace" : "Access setup required"}
          </h1>

          {configured ? (
            <>
              <p className="mt-4 text-sm leading-6 text-ink-mid">
                Enter the server-configured access phrase to open course links and study tools.
              </p>
              <form onSubmit={submit} className="mt-8">
                <label
                  htmlFor="study-hub-password"
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-low"
                >
                  Access phrase
                </label>
                <input
                  id="study-hub-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  maxLength={256}
                  className="mt-3 w-full rounded-lg border border-line bg-bs px-4 py-3 text-sm text-ink-hi outline-none transition-colors placeholder:text-ink-faint focus:border-accent/60"
                  placeholder="Enter access phrase"
                />
                {error && (
                  <p className="mt-3 text-sm text-neg" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full rounded-lg bg-accent px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-bs transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Checking…" : "Open Study Hub"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-6 text-ink-mid">
                The server is refusing to expose course data because its access secrets are not configured. This is the safe production default.
              </p>
              <div className="mt-7 rounded-xl border border-line bg-bs p-4 font-mono text-[10px] leading-6 text-ink-low">
                <p>STUDY_HUB_ACCESS_PASSWORD</p>
                <p>STUDY_HUB_SESSION_SECRET</p>
              </div>
              <p className="mt-5 text-xs leading-5 text-ink-low">
                Set both values in the deployment secret manager. Never add their values to Git or client-side environment variables.
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
export function StudyHubLogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const logout = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/study-hub/logout", { method: "POST" });
      await router.push("/study-hub");
      router.reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={submitting}
      className="rounded-md border border-line px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:border-line-strong hover:text-ink-hi disabled:opacity-50"
    >
      {submitting ? "Closing…" : "Lock"}
    </button>
  );
}
