import type { DeviceType } from "@/lib/types";

export type CoarseUserAgent = {
  deviceType: DeviceType;
  browser: string;
};

/**
 * Coarse, non-fingerprinting UA classification for portfolio analytics.
 * Does not store the raw user-agent string.
 */
export function parseUserAgent(userAgent: string | null): CoarseUserAgent {
  if (!userAgent) {
    return { deviceType: "unknown", browser: "unknown" };
  }

  const ua = userAgent.toLowerCase();

  let deviceType: DeviceType = "desktop";
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/.test(ua)) {
    deviceType = "tablet";
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(ua)) {
    deviceType = "mobile";
  }

  let browser = "other";
  if (ua.includes("edg/")) {
    browser = "edge";
  } else if (ua.includes("chrome/") && !ua.includes("edg/")) {
    browser = "chrome";
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "safari";
  } else if (ua.includes("firefox/")) {
    browser = "firefox";
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    browser = "opera";
  }

  return { deviceType, browser };
}

export function truncateReferrer(referrer: string | null): string | null {
  if (!referrer) {
    return null;
  }

  const trimmed = referrer.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 512);
}
