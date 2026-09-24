import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        That page does not exist.
      </p>
      <p className="mt-6 text-sm">
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Go home
        </Link>
      </p>
    </main>
  );
}
