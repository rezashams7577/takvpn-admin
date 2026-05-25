"use client";

import { useEffect, useState } from "react";
import { AdminPage, AdminStatCard } from "@/components/admin";
import { PanelPageHeader } from "@/components/layout";
import { adminStats, type AdminStats } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, []);

  if (err) return <p className="text-sm text-[var(--danger)]">{err}</p>;
  if (!stats) return <p className="text-[var(--muted)]">Loading…</p>;

  const cards = [
    { label: "Total customers", value: stats.total_customers },
    { label: "Pending Zarinpal payments", value: stats.pending_zarinpal },
    { label: "Orders today", value: stats.orders_today },
    { label: "Active VPN services", value: stats.active_vpn_services },
  ];

  return (
    <AdminPage className="max-w-5xl">
      <PanelPageHeader title="Dashboard" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <AdminStatCard key={c.label} label={c.label} value={c.value} />
        ))}
      </div>
    </AdminPage>
  );
}
