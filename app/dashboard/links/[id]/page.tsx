import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BreakdownList, Stat } from "@/components/analytics/stats";
import { CopyButton } from "@/components/copy-button";
import { EditLinkForm } from "@/components/links/edit-link-form";
import { getLinkAnalytics } from "@/lib/analytics";
import { absoluteShortUrl, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Link details",
};

export default async function LinkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const analytics = await getLinkAnalytics(user.id, id);
  if (!analytics) {
    notFound();
  }

  const { link, totalClicks, recentClicks, referrers, devices, browsers } =
    analytics;
  const shortUrl = absoluteShortUrl(link.short_code);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {link.title || `/${link.short_code}`}
            </h1>
            <p className="mt-1 font-mono text-sm text-[var(--accent)]">
              {shortUrl}
            </p>
          </div>
          <CopyButton value={shortUrl} label="Copy short URL" />
        </div>
      </div>

      <div className="border-b border-[var(--border)] pb-6">
        <Stat label="Total clicks" value={totalClicks} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Edit link</h2>
          <div className="mt-4">
            <EditLinkForm link={link} />
          </div>
        </section>

        <div className="space-y-8">
          <BreakdownList
            title="Referrers"
            items={referrers}
            empty="No referrer data yet."
          />
          <BreakdownList
            title="Devices"
            items={devices}
            empty="No device data yet."
          />
          <BreakdownList
            title="Browsers"
            items={browsers}
            empty="No browser data yet."
          />
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold">Recent clicks</h2>
        {recentClicks.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No clicks recorded yet.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">When</th>
                  <th className="px-3 py-2 font-medium">Referrer</th>
                  <th className="px-3 py-2 font-medium">Device</th>
                  <th className="px-3 py-2 font-medium">Browser</th>
                </tr>
              </thead>
              <tbody>
                {recentClicks.map((click) => (
                  <tr
                    key={click.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-3 py-2 text-[var(--muted)]">
                      {formatDateTime(click.clicked_at)}
                    </td>
                    <td className="max-w-xs truncate px-3 py-2">
                      {click.referrer || "(direct)"}
                    </td>
                    <td className="px-3 py-2">{click.device_type || "—"}</td>
                    <td className="px-3 py-2">{click.browser || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
