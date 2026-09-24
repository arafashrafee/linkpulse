"use server";

import { redirect } from "next/navigation";

import { safeInternalPath } from "@/lib/auth/safe-redirect";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, SignUpResult } from "@/lib/types";

export async function signUp(
  _prev: SignUpResult | null,
  formData: FormData,
): Promise<SignUpResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    ok: true,
    needsEmailConfirmation: true,
  };
}

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect(safeInternalPath(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
