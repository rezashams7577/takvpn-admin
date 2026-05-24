"use client";

import { useEffect, useState } from "react";
import { adminStats, type AdminStats } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminStats()
      .then(setStats)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, []);

  if (err) return <p className="text-red-600 text-sm">{err}</p>;
  if (!stats) return <p className="text-[var(--muted)]">Loading…</p>;

  const cards = [
    { label: "Total customers", value: stats.total_customers },
    { label: "Pending Zarinpal payments", value: stats.pending_zarinpal },
    { label: "Orders today", value: stats.orders_today },
    { label: "Active VPN services", value: stats.active_vpn_services },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <p className="text-sm text-[var(--muted)]">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
