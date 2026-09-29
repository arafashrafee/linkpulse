"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signIn, signUp } from "@/actions/auth";
import type { ActionResult, SignUpResult } from "@/lib/types";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

export function AuthForm({ mode, nextPath = "/dashboard" }: AuthFormProps) {
  if (mode === "signup") {
    return <SignUpForm />;
  }

  return <SignInForm nextPath={nextPath} />;
}

function SignInForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(
    signIn,
    null as ActionResult | null,
  );

  return (
    <AuthFormFields
      mode="login"
      nextPath={nextPath}
      state={state}
      formAction={formAction}
      pending={pending}
    />
  );
}

function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUp,
    null as SignUpResult | null,
  );

  if (state?.ok && state.needsEmailConfirmation) {
    return (
      <div className="auth-panel">
        <h1 className="text-3xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We sent a confirmation link to your inbox. Open it to activate your
          account, then sign in.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <AuthFormFields
      mode="signup"
      nextPath="/dashboard"
      state={state}
      formAction={formAction}
      pending={pending}
    />
  );
}

type AuthFormFieldsProps = {
  mode: "login" | "signup";
  nextPath: string;
  state: ActionResult | SignUpResult | null;
  formAction: (payload: FormData) => void;
  pending: boolean;
};

function AuthFormFields({
  mode,
  nextPath,
  state,
  formAction,
  pending,
}: AuthFormFieldsProps) {
  return (
    <form
      action={formAction}
      className="auth-panel"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        {mode === "login" ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {mode === "login"
          ? "Welcome back to LinkPulse."
          : "Start shortening links and reading the signals."}
      </p>

      <input type="hidden" name="next" value={nextPath} />

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="field-input"
          />
        </div>
      </div>

      {state && !state.ok ? (
        <p className="mt-4 text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-6 w-full"
      >
        {pending
          ? mode === "login"
            ? "Signing in…"
            : "Creating account…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-[var(--accent)] hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
