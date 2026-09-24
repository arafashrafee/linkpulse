"use server";

import { revalidatePath } from "next/cache";

import { generateShortCode, MAX_ATTEMPTS, normalizeShortCode } from "@/lib/short-code";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ActionResultWithId } from "@/lib/types";
import {
  createLinkSchema,
  customAliasSchema,
  parseSafeHttpUrl,
  updateLinkSchema,
} from "@/lib/validations/links";

const LINK_INACCESSIBLE = "Link not found or inaccessible.";

function firstZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export async function createLink(formData: FormData): Promise<ActionResultWithId> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const parsed = createLinkSchema.safeParse({
    destinationUrl: formData.get("destinationUrl"),
    title: formData.get("title") ?? "",
    customAlias: formData.get("customAlias") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const safeUrl = parseSafeHttpUrl(parsed.data.destinationUrl);
  if (!safeUrl.ok) {
    return { ok: false, error: safeUrl.error };
  }

  const title =
    parsed.data.title && parsed.data.title.length > 0
      ? parsed.data.title
      : null;

  let shortCode: string;

  if (parsed.data.customAlias && parsed.data.customAlias.length > 0) {
    const alias = customAliasSchema.safeParse(parsed.data.customAlias);
    if (!alias.success) {
      return { ok: false, error: firstZodError(alias.error) };
    }
    shortCode = alias.data;
  } else {
    shortCode = generateShortCode();
  }

  let lastError = "Could not create link.";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = attempt === 0 ? shortCode : generateShortCode();

    // Custom aliases do not retry with a new code.
    if (attempt > 0 && parsed.data.customAlias) {
      break;
    }

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        destination_url: safeUrl.url,
        short_code: normalizeShortCode(code),
        title,
      })
      .select("id")
      .single();

    if (!error && data) {
      revalidatePath("/dashboard");
      return { ok: true, id: data.id };
    }

    if (error?.code === "23505") {
      lastError = parsed.data.customAlias
        ? "That alias is already taken."
        : "Could not allocate a unique short code. Please try again.";
      if (parsed.data.customAlias) {
        return { ok: false, error: lastError };
      }
      continue;
    }

    lastError = error?.message ?? lastError;
    break;
  }

  return { ok: false, error: lastError };
}

export async function updateLink(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const isActiveRaw = formData.get("isActive");
  const parsed = updateLinkSchema.safeParse({
    linkId: formData.get("linkId"),
    destinationUrl: formData.get("destinationUrl"),
    title: formData.get("title") ?? "",
    isActive: isActiveRaw === "true" || isActiveRaw === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const safeUrl = parseSafeHttpUrl(parsed.data.destinationUrl);
  if (!safeUrl.ok) {
    return { ok: false, error: safeUrl.error };
  }

  const title =
    parsed.data.title && parsed.data.title.length > 0
      ? parsed.data.title
      : null;

  const { data, error } = await supabase
    .from("links")
    .update({
      destination_url: safeUrl.url,
      title,
      is_active: parsed.data.isActive,
    })
    .eq("id", parsed.data.linkId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: LINK_INACCESSIBLE };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/links/${parsed.data.linkId}`);
  return { ok: true };
}

export async function toggleLinkActive(
  linkId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("links")
    .update({ is_active: isActive })
    .eq("id", linkId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: LINK_INACCESSIBLE };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/links/${linkId}`);
  return { ok: true };
}

export async function deleteLink(linkId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return { ok: false, error: LINK_INACCESSIBLE };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
