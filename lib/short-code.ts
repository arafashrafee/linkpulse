import { randomBytes } from "node:crypto";

/**
 * Lowercase alphanumeric alphabet with ambiguous glyphs removed:
 * excluded: 0, o, 1, l, i
 */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 7;
const MAX_ATTEMPTS = 8;

export function generateShortCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i]! % ALPHABET.length];
  }

  return code;
}

export function normalizeShortCode(value: string): string {
  return value.trim().toLowerCase();
}

export { CODE_LENGTH, MAX_ATTEMPTS };
