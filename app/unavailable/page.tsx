import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link unavailable",
};

export default function UnavailablePage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
        LinkPulse
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        This link is unavailable
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The short link may be invalid, removed, or temporarily disabled.
      </p>
      <p className="mt-8 text-sm">
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Go to LinkPulse
        </Link>
      </p>
    </main>
  );
}
