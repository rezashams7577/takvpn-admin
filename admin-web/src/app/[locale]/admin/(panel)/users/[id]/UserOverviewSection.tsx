"use client";

import { useTranslations } from "next-intl";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminMetaGrid } from "@/components/admin/AdminMetaGrid";
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

  const items = [
    { label: t("labelRole"), value: role },
    { label: t("labelStatus"), value: status },
  ];

  if (name) {
    items.push({ label: t("labelName"), value: name });
  }
  if (createdAt) {
    items.push({
      label: t("labelCreated"),
      value: new Date(createdAt).toLocaleString(),
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
