/**
 * Validate post-auth redirect targets to prevent open redirects.
 * Only same-app relative paths are allowed.
 */
export function safeInternalPath(
  value: unknown,
  fallback = "/dashboard",
): string {
  if (typeof value !== "string" || value.length === 0) {
    return fallback;
  }

  if (containsUnsafeChars(value)) {
    return fallback;
  }

  let decoded: string;
  try {
    decoded = fullyDecode(value);
  } catch {
    return fallback;
  }

  if (containsUnsafeChars(decoded)) {
    return fallback;
  }

  // Must be a single-slash relative path (not protocol-relative).
  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return fallback;
  }

  // Reject absolute URLs / schemes smuggled into the path.
  if (decoded.includes("://") || /^[a-z][a-z0-9+.-]*:/i.test(decoded)) {
    return fallback;
  }

  try {
    const base = "https://linkpulse.local";
    const resolved = new URL(decoded, base);

    // Protocol-relative or absolute inputs change the origin.
    if (resolved.origin !== base) {
      return fallback;
    }

    const result = `${resolved.pathname}${resolved.search}${resolved.hash}`;

    if (!result.startsWith("/") || result.startsWith("//")) {
      return fallback;
    }

    if (containsUnsafeChars(result)) {
      return fallback;
    }

    return result;
  } catch {
    return fallback;
  }
}

function containsUnsafeChars(value: string): boolean {
  return value.includes("\\") || value.includes("\0");
}

/**
 * Decode nested percent-encoding a bounded number of times so tricks like
 * /%2F%2Fevil.com and /%252F%252Fevil.com cannot slip through.
 */
function fullyDecode(value: string): string {
  let current = value;

  for (let i = 0; i < 5; i += 1) {
    const next = decodeURIComponent(current.replace(/\+/g, " "));
    if (next === current) {
      return current;
    }
    current = next;
  }

  return current;
}
