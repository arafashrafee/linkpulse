import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { absoluteShortUrl, formatCount, formatDateTime } from "@/lib/format";
import type { LinkRow } from "@/lib/types";

type LinksTableProps = {
  links: Array<LinkRow & { click_count: number }>;
};

export function LinksTable({ links }: LinksTableProps) {
  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-10 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">
          No links yet
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create your first short link above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 font-medium">Link</th>
            <th className="px-3 py-2 font-medium">Clicks</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => {
            const shortUrl = absoluteShortUrl(link.short_code);
            return (
              <tr
                key={link.id}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td className="px-3 py-3 align-top">
                  <div className="font-medium text-[var(--foreground)]">
                    {link.title || `/${link.short_code}`}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-[var(--accent)]">
                    /{link.short_code}
                  </div>
                  <div className="mt-1 max-w-xs truncate text-xs text-[var(--muted)]">
                    {link.destination_url}
                  </div>
                </td>
                <td className="px-3 py-3 align-top tabular-nums">
                  {formatCount(link.click_count)}
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={
                      link.is_active
                        ? "text-[var(--success)]"
                        : "text-[var(--muted)]"
                    }
                  >
                    {link.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-3 py-3 align-top text-[var(--muted)]">
                  {formatDateTime(link.created_at)}
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton value={shortUrl} />
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="text-xs font-medium text-[var(--accent)] hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
