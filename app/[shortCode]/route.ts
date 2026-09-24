import { NextResponse } from "next/server";

import { isReservedAlias } from "@/lib/reserved-aliases";
import { normalizeShortCode } from "@/lib/short-code";
import { createClient } from "@/lib/supabase/server";
import { parseUserAgent, truncateReferrer } from "@/lib/ua";
import { isSafeHttpUrl } from "@/lib/validations/links";

type RouteContext = {
  params: Promise<{ shortCode: string }>;
};

/**
 * Public short-link resolver.
 *
 * Uses SECURITY DEFINER RPC `resolve_and_click`
 * (EXECUTE granted to anon and authenticated only).
 * No service-role key. No broad anon SELECT on links / INSERT on clicks.
 *
 * If the link is active but click recording fails inside the RPC, the
 * function still returns destination_url so redirect availability wins.
 */
export async function GET(request: Request, context: RouteContext) {
  const { shortCode: rawCode } = await context.params;
  const shortCode = normalizeShortCode(rawCode);

  if (
    !shortCode ||
    shortCode.length < 3 ||
    shortCode.length > 32 ||
    !/^[a-z0-9_-]+$/.test(shortCode) ||
    isReservedAlias(shortCode)
  ) {
    return NextResponse.rewrite(new URL("/unavailable", request.url));
  }

  const referrer = truncateReferrer(request.headers.get("referer"));
  const { deviceType, browser } = parseUserAgent(
    request.headers.get("user-agent"),
  );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_and_click", {
    p_code: shortCode,
    p_referrer: referrer,
    p_device_type: deviceType,
    p_browser: browser,
  });

  if (error || !data || data.length === 0) {
    return NextResponse.rewrite(new URL("/unavailable", request.url));
  }

  const destination = data[0]?.destination_url;

  // Defense in depth: never redirect to a non-http(s) destination.
  if (!destination || !isSafeHttpUrl(destination)) {
    return NextResponse.rewrite(new URL("/unavailable", request.url));
  }

  // Re-parse to normalize; do not fetch the destination.
  const parsed = new URL(destination);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.rewrite(new URL("/unavailable", request.url));
  }

  return NextResponse.redirect(parsed.toString(), {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
