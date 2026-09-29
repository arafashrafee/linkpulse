import Link from "next/link";
import { Activity } from "lucide-react";

import { signOut } from "@/actions/auth";

type SiteHeaderProps = {
  userEmail?: string | null;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={userEmail ? "/dashboard" : "/"}
          className="brand-lockup"
        >
          <span className="brand-mark"><Activity size={21} aria-hidden="true" /></span>
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
                className="btn-primary"
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
