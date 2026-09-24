import Link from "next/link";

import { signOut } from "@/actions/auth";

type SiteHeaderProps = {
  userEmail?: string | null;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href={userEmail ? "/dashboard" : "/"}
          className="text-sm font-semibold tracking-tight text-[var(--foreground)]"
        >
          LinkPulse
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {userEmail ? (
            <>
              <span className="hidden text-[var(--muted)] sm:inline">
                {userEmail}
              </span>
              <Link
                href="/dashboard"
                className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--foreground)] transition hover:bg-[var(--bg-subtle)]"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-white transition hover:bg-[var(--accent-hover)]"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
