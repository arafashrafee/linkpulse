import { createClient } from "@/lib/supabase/server";
import type { ClickRow, LinkRow } from "@/lib/types";

export type DashboardStats = {
  totalLinks: number;
  totalClicks: number;
  clicksLast7Days: number;
  recentLinks: Array<LinkRow & { click_count: number }>;
};

export type BreakdownItem = {
  label: string;
  count: number;
};

export type LinkAnalytics = {
  link: LinkRow;
  totalClicks: number;
  recentClicks: ClickRow[];
  referrers: BreakdownItem[];
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
};

function aggregate(
  rows: Array<string | null>,
  emptyLabel = "(none)",
): BreakdownItem[] {
  const counts = new Map<string, number>();

  for (const value of rows) {
    const label = value && value.length > 0 ? value : emptyLabel;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (linksError) {
    throw new Error(linksError.message);
  }

  const linkRows = links ?? [];
  const linkIds = linkRows.map((link) => link.id);

  if (linkIds.length === 0) {
    return {
      totalLinks: 0,
      totalClicks: 0,
      clicksLast7Days: 0,
      recentLinks: [],
    };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: clicks, error: clicksError } = await supabase
    .from("clicks")
    .select("link_id, clicked_at")
    .in("link_id", linkIds);

  if (clicksError) {
    throw new Error(clicksError.message);
  }

  const clickRows = clicks ?? [];
  const totalClicks = clickRows.length;
  const clicksLast7Days = clickRows.filter(
    (click) => new Date(click.clicked_at) >= sevenDaysAgo,
  ).length;

  const countsByLink = new Map<string, number>();
  for (const click of clickRows) {
    countsByLink.set(
      click.link_id,
      (countsByLink.get(click.link_id) ?? 0) + 1,
    );
  }

  const recentLinks = linkRows.slice(0, 10).map((link) => ({
    ...link,
    click_count: countsByLink.get(link.id) ?? 0,
  }));

  return {
    totalLinks: linkRows.length,
    totalClicks,
    clicksLast7Days,
    recentLinks,
  };
}

export async function getLinkAnalytics(
  userId: string,
  linkId: string,
): Promise<LinkAnalytics | null> {
  const supabase = await createClient();

  const { data: link, error: linkError } = await supabase
    .from("links")
    .select("*")
    .eq("id", linkId)
    .eq("user_id", userId)
    .maybeSingle();

  if (linkError) {
    throw new Error(linkError.message);
  }

  if (!link) {
    return null;
  }

  const { data: clicks, error: clicksError } = await supabase
    .from("clicks")
    .select("*")
    .eq("link_id", linkId)
    .order("clicked_at", { ascending: false });

  if (clicksError) {
    throw new Error(clicksError.message);
  }

  const clickRows = clicks ?? [];

  return {
    link,
    totalClicks: clickRows.length,
    recentClicks: clickRows.slice(0, 20),
    referrers: aggregate(
      clickRows.map((c) => c.referrer),
      "(direct)",
    ),
    devices: aggregate(clickRows.map((c) => c.device_type)),
    browsers: aggregate(clickRows.map((c) => c.browser)),
  };
}
