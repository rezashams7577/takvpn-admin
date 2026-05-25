"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatUsdt } from "@/lib/format";
import {
  AdminButton,
  AdminListShell,
  AdminPage,
} from "@/components/admin";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormField, FormMessage, FormSelect } from "@/components/forms";
import {
  adminListUSDT,
  adminApproveUSdt,
  adminRejectUSDT,
  type USDTDeposit,
} from "@/lib/admin-api";

export default function AdminDepositsPage() {
  const t = useTranslations("adminPanel");
  const [usdtDeposits, setUsdtDeposits] = useState<USDTDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("pending");
  const [txHash, setTxHash] = useState("");

  function load() {
    setLoading(true);
    setErr("");
    adminListUSDT(status)
      .then(setUsdtDeposits)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [status]);

  async function approveUSDT(id: number) {
    try {
      await adminApproveUSdt(id, txHash, "approved via admin panel");
      setMsg(`Approved USDT #${id}`);
      setTxHash("");
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function rejectUSDT(id: number) {
    try {
      await adminRejectUSDT(id, "rejected via admin panel");
      setMsg(`Rejected USDT #${id}`);
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  const empty = !loading && !err && usdtDeposits.length === 0;

  return (
    <AdminPage>
      <PanelPageHeader title={t("deposits")} description={t("zarinpalDepositsHint")} />
      <p className="text-sm">
        <Link href="/admin/transactions" className="text-brand-600 underline">
          {t("viewZarinpalPayments")}
        </Link>
      </p>

      <PanelSection title={t("usdtDeposits")}>
        <div className="admin-form max-w-md space-y-3" dir="ltr">
          <FormSelect
            label={t("depositStatusFilter")}
            name="status_filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "expired", label: "Expired" },
              { value: "cancelled", label: "Cancelled" },
              { value: "", label: "All" },
            ]}
          />
          <FormField
            label={t("usdtTxHashForApprove")}
            name="tx_hash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            dir="ltr"
            placeholder={t("usdtTxHashForApprove")}
          />
        </div>
        {msg && <FormMessage variant="success" className="mt-4">{msg}</FormMessage>}
        {err && <FormMessage variant="error" className="mt-4">{err}</FormMessage>}

        <AdminListShell loading={loading} error={err} empty={empty}>
          <ul className="mt-6 space-y-3">
            {usdtDeposits.map((d) => (
              <li
                key={d.id}
                className="border border-[var(--border)] rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
              >
                <span className="text-sm" dir="ltr">
                  #{d.id} — {d.customer_email} — {d.network} — pay {formatUsdt(d.pay_amount)} / credit{" "}
                  {formatUsdt(d.credit_amount)} — {d.status}
                  {d.tx_hash ? ` — tx ${d.tx_hash.slice(0, 12)}…` : ""}
                </span>
                {(d.status === "pending" || d.status === "confirming" || d.status === "expired") && (
                  <div className="flex gap-2 shrink-0">
                    <AdminButton variant="success" onClick={() => approveUSDT(d.id)}>
                      Approve
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => rejectUSDT(d.id)}>
                      Reject
                    </AdminButton>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </AdminListShell>
      </PanelSection>
    </AdminPage>
  );
}
