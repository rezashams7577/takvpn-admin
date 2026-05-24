"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminListShell } from "@/components/admin/AdminListShell";
import { adminListPlans, type AdminPlan } from "@/lib/admin-api";
import { formatIrr, formatUsdt } from "@/lib/format";

const thClass = "py-2 px-4 font-medium text-start whitespace-nowrap";
const tdClass = "py-3 px-4 text-start align-middle";

export default function AdminPlansPage() {
  const t = useTranslations("adminPanel");
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminListPlans()
      .then(setPlans)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("plans")}</h1>
        <Link
          href="/admin/plans/new"
          className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
        >
          New plan
        </Link>
      </div>
      <AdminListShell loading={loading} error={err} empty={!loading && !err && plans.length === 0}>
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]" dir="ltr">
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card)] text-[var(--muted)]">
                <th className={thClass}>Name</th>
                <th className={thClass}>Slug</th>
                <th className={`${thClass} tabular-nums`}>USDT</th>
                <th className={`${thClass} tabular-nums`}>IRR</th>
                <th className={`${thClass} tabular-nums`}>Days</th>
                <th className={thClass}>Active</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                  <td className={tdClass}>{p.name}</td>
                  <td className={`${tdClass} font-mono text-xs text-[var(--muted)]`}>{p.slug}</td>
                  <td className={`${tdClass} tabular-nums`}>{formatUsdt(p.price_usdt)}</td>
                  <td className={`${tdClass} tabular-nums`}>{formatIrr(p.price_irr, "en")}</td>
                  <td className={`${tdClass} tabular-nums`}>{p.duration_days}</td>
                  <td className={tdClass}>{p.is_active ? "Yes" : "No"}</td>
                  <td className={tdClass}>
                    <Link href={`/admin/plans/${p.id}/edit`} className="text-brand-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminListShell>
    </div>
  );
}
