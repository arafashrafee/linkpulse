import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Stat } from "@/components/analytics/stats";
import { CreateLinkForm } from "@/components/links/create-link-form";
import { LinksTable } from "@/components/links/links-table";
import { getDashboardStats } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getDashboardStats(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create links and review recent activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-[var(--border)] pb-6 sm:grid-cols-3">
        <Stat label="Total links" value={stats.totalLinks} />
        <Stat label="Total clicks" value={stats.totalClicks} />
        <Stat label="Clicks · 7 days" value={stats.clicksLast7Days} />
      </div>

      <CreateLinkForm />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Recent links
        </h2>
        <LinksTable links={stats.recentLinks} />
      </section>
    </div>
  );
}
