/**
 * Central reserved short-code / alias denylist.
 * Extend this list when adding top-level application routes.
 */
export const RESERVED_ALIASES = [
  "login",
  "signup",
  "signin",
  "dashboard",
  "api",
  "auth",
  "settings",
  "_next",
  "favicon.ico",
  "unavailable",
] as const;

export type ReservedAlias = (typeof RESERVED_ALIASES)[number];

export function isReservedAlias(value: string): boolean {
  return (RESERVED_ALIASES as readonly string[]).includes(value.toLowerCase());
}
