import { z } from "zod";

import { isReservedAlias } from "@/lib/reserved-aliases";

const MAX_URL_LENGTH = 2048;

/**
 * Parse and allow only http:/https: destinations.
 * Localhost and private hosts are intentionally allowed for MVP/dev.
 * Does not fetch the destination.
 */
export function parseSafeHttpUrl(raw: string):
  | { ok: true; url: string }
  | { ok: false; error: string } {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, error: "Destination URL is required." };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: "Destination URL is too long." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "Enter a valid URL." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      ok: false,
      error: "Only http:// and https:// destinations are allowed.",
    };
  }

  if (!parsed.hostname) {
    return { ok: false, error: "Enter a valid URL with a host." };
  }

  return { ok: true, url: parsed.toString() };
}

export function isSafeHttpUrl(raw: string): boolean {
  return parseSafeHttpUrl(raw).ok;
}

const shortCodeCharset = /^[a-z0-9_-]+$/;

export const customAliasSchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(
    z
      .string()
      .min(3, "Alias must be at least 3 characters.")
      .max(32, "Alias must be at most 32 characters.")
      .regex(
        shortCodeCharset,
        "Alias may only contain lowercase letters, numbers, hyphens, and underscores.",
      )
      .refine((value) => !isReservedAlias(value), {
        message: "This alias is reserved.",
      }),
  );

export const createLinkSchema = z.object({
  destinationUrl: z.string().trim().min(1, "Destination URL is required."),
  title: z
    .string()
    .trim()
    .max(120, "Title must be at most 120 characters.")
    .optional()
    .or(z.literal("")),
  customAlias: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export const updateLinkSchema = z.object({
  linkId: z.string().uuid(),
  destinationUrl: z.string().trim().min(1, "Destination URL is required."),
  title: z
    .string()
    .trim()
    .max(120, "Title must be at most 120 characters.")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
