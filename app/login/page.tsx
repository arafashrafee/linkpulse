import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { safeInternalPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = safeInternalPath(params.next);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <AuthForm mode="login" nextPath={nextPath} />
      </main>
    </>
  );
}
