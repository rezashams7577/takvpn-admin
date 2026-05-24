"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminMetaGrid } from "@/components/admin/AdminMetaGrid";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminRole } from "@/components/admin/AdminRoleContext";
import { PanelActionRow, PanelPageHeader, PanelSection } from "@/components/layout";
import { FormMessage } from "@/components/forms";
import {
  adminGetOrder,
  adminReprovisionVPN,
  type AdminOrderDetail,
  type VPNServiceAdmin,
} from "@/lib/admin-api";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const locale = useLocale();
  const t = useTranslations("adminPanel");
  const role = useAdminRole();
  const canReprovision = role === "admin" || role === "super_admin";
  const [data, setData] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [reprovisionMsg, setReprovisionMsg] = useState("");
  const [reprovisionErr, setReprovisionErr] = useState("");

  const reload = useCallback(() => {
    setLoading(true);
    setLoadErr("");
    adminGetOrder(Number(id))
      .then(setData)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : t("failed")))
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function reprovision(vpn: VPNServiceAdmin) {
    setReprovisionMsg("");
    setReprovisionErr("");
    try {
      await adminReprovisionVPN(vpn.id);
      setReprovisionMsg(t("reprovisionQueued", { id: vpn.id }));
      reload();
    } catch (e) {
      setReprovisionErr(e instanceof Error ? e.message : t("failed"));
    }
  }

  if (loading) return <p className="text-[var(--muted)]">{t("loading")}</p>;
  if (loadErr && !data) return <p className="text-red-600 text-sm">{loadErr}</p>;
  if (!data) return <p className="text-[var(--muted)]">{t("noRecords")}</p>;

  const { order, vpn_service: vpn } = data;

  const orderItems = [
    {
      label: t("labelCustomer"),
      value: (
        <Link href={`/admin/users/${order.customer_id}`} className="text-brand-600">
          {order.customer_email}
        </Link>
      ),
    },
    { label: t("labelPlan"), value: order.plan_name },
    { label: t("labelStatus"), value: order.status },
    {
      label: t("labelAmount"),
      value: `${formatWalletBalance(order.amount, order.currency, locale)} ${order.currency}`,
    },
    {
      label: t("labelCreated"),
      value: new Date(order.created_at).toLocaleString(),
    },
  ];

  const vpnItems = vpn
    ? [
        { label: t("labelId"), value: vpn.id },
        { label: t("labelStatus"), value: vpn.status },
        ...(vpn.comment
          ? [{ label: t("comment"), value: vpn.comment }]
          : []),
        ...(vpn.public_key
          ? [
              {
                label: t("publicKey"),
                value: (
                  <span className="font-mono text-xs break-all">{vpn.public_key}</span>
                ),
                className: "sm:col-span-2",
              },
            ]
          : []),
        ...(vpn.expires_at
          ? [{ label: t("labelExpires"), value: vpn.expires_at }]
          : []),
      ]
    : [];

  return (
    <AdminPage>
      <AdminBackLink href="/admin/orders" label={t("backToOrders")} />
      <PanelPageHeader title={`${t("orderDetail")} #${order.id}`} />

      <PanelSection title={t("orderDetailsSection")}>
        <AdminMetaGrid items={orderItems} />
      </PanelSection>

      {vpn && (
        <PanelSection title={t("orderVpnSection")}>
          <AdminMetaGrid items={vpnItems} />
          {canReprovision &&
            (vpn.status === "failed" || vpn.status === "provisioning") && (
              <div className="mt-4 border-t border-[var(--border)] pt-4 -mb-2">
                <PanelActionRow
                  title={t("reprovisionTitle")}
                  description={t("reprovisionDesc")}
                  action={
                    <button
                      type="button"
                      onClick={() => reprovision(vpn)}
                      className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
                    >
                      {t("reprovision")}
                    </button>
                  }
                />
                {reprovisionMsg && (
                  <FormMessage variant="success" className="mt-2">
                    {reprovisionMsg}
                  </FormMessage>
                )}
                {reprovisionErr && (
                  <FormMessage variant="error" className="mt-2">
                    {reprovisionErr}
                  </FormMessage>
                )}
              </div>
            )}
        </PanelSection>
      )}
    </AdminPage>
  );
}
