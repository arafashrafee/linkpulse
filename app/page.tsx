import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader userEmail={user?.email} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          LinkPulse
        </p>
        <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Short links.
          <br />
          Clear signals.
        </h1>
        <p className="mt-4 max-w-md text-base text-[var(--muted)] sm:text-lg">
          Create compact links and understand how they’re being used.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--bg-subtle)]"
          >
            Sign in
          </Link>
        </div>
      </main>
    </>
  );
}
