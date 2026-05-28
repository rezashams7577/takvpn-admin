"use client";

import { useTranslations } from "next-intl";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminMetaGrid, type AdminMetaItem } from "@/components/admin/AdminMetaGrid";
import { PanelPageHeader, PanelSection } from "@/components/layout";

type Props = {
  email: string;
  role: string;
  status: string;
  name?: string;
  createdAt?: string;
};

export function UserOverviewSection({ email, role, status, name, createdAt }: Props) {
  const t = useTranslations("adminPanel");

  const items: AdminMetaItem[] = [
    { label: t("labelRole"), value: role },
    { label: t("labelStatus"), value: status },
  ];

  if (name) {
    items.push({ label: t("labelName"), value: name });
  }
  if (createdAt) {
    items.push({
      label: t("labelCreated"),
      value: (
        <span dir="ltr" className="inline-block">
          {new Date(createdAt).toLocaleString()}
        </span>
      ),
    });
  }

  return (
    <>
      <AdminBackLink href="/admin/users" label={t("backToUsers")} />
      <PanelPageHeader title={email} description={t("userDetailTitle")} />
      <PanelSection title={t("userOverviewSection")}>
        <AdminMetaGrid items={items} />
      </PanelSection>
    </>
  );
}
