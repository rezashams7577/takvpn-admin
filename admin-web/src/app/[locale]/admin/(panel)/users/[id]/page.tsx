"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminRole } from "@/components/admin/AdminRoleContext";
import {
  adminGetCustomer,
  adminListWalletTxns,
  asArray,
  type WalletTransaction,
} from "@/lib/admin-api";
import { UserAccountSection } from "./UserAccountSection";
import { UserOrdersSection } from "./UserOrdersSection";
import { UserOverviewSection } from "./UserOverviewSection";
import { UserRoleSection } from "./UserRoleSection";
import { UserSecuritySection } from "./UserSecuritySection";
import { UserWalletHistorySection } from "./UserWalletHistorySection";
import { UserWalletsSection } from "./UserWalletsSection";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const t = useTranslations("adminPanel");
  const role = useAdminRole();
  const customerId = Number(id);
  const canAdjustWallet =
    role === "support" || role === "admin" || role === "super_admin";
  const canChangeRole = role === "super_admin";

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [walletTxns, setWalletTxns] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const reload = useCallback(() => {
    setLoading(true);
    setLoadErr("");
    Promise.all([adminGetCustomer(customerId), adminListWalletTxns(customerId)])
      .then(([cust, txns]) => {
        setData(cust);
        setWalletTxns(txns);
      })
      .catch((e) => setLoadErr(e instanceof Error ? e.message : t("failed")))
      .finally(() => setLoading(false));
  }, [customerId, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) return <p className="text-[var(--muted)]">{t("loading")}</p>;
  if (!data) return <p className="text-red-600 text-sm">{loadErr || t("noRecords")}</p>;

  const email = String(data.email);
  const userRole = String(data.role);
  const status = String(data.status);
  const name = data.name != null ? String(data.name) : undefined;
  const createdAt =
    data.created_at != null ? String(data.created_at) : undefined;

  const wallets = asArray(
    data.wallets as { currency: string; balance: string }[] | null | undefined
  );
  const orders = asArray(
    data.orders as
      | { id: number; status: string; amount: string; currency?: string }[]
      | null
      | undefined
  );

  return (
    <AdminPage>
      <UserOverviewSection
        email={email}
        role={userRole}
        status={status}
        name={name}
        createdAt={createdAt}
      />
      <UserAccountSection
        customerId={customerId}
        status={status}
        staffRole={role}
        onUpdated={reload}
      />
      <UserWalletsSection
        customerId={customerId}
        wallets={wallets}
        canAdjust={canAdjustWallet}
        onAdjusted={reload}
      />
      <UserWalletHistorySection transactions={walletTxns} />
      <UserOrdersSection orders={orders} />
      <UserSecuritySection customerId={customerId} />
      {canChangeRole && (
        <UserRoleSection
          customerId={customerId}
          currentRole={userRole}
          onUpdated={reload}
        />
      )}
    </AdminPage>
  );
}
