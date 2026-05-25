"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  AdminDataTable,
  AdminListShell,
  AdminPage,
  AdminPagination,
  AdminSearchForm,
  AdminTableBody,
  AdminTableHead,
  AdminTableRow,
  AdminTableTd,
  AdminTableTh,
} from "@/components/admin";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { adminListCustomers, type CustomerListItem } from "@/lib/admin-api";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const t = useTranslations("adminPanel");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  function load(search = q, p = page) {
    setLoading(true);
    setErr("");
    adminListCustomers(search, p)
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [page]);

  return (
    <AdminPage>
      <PanelPageHeader title={t("users")} />
      <PanelSection title={t("users")}>
        <AdminSearchForm
          value={q}
          onChange={setQ}
          submitLabel="Search"
          placeholder="Search email or name"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load(q, 1);
          }}
        />
        <p className="text-sm text-[var(--muted)] mt-4">{total} users</p>
        <AdminListShell loading={loading} error={err} empty={!loading && !err && items.length === 0}>
          <AdminDataTable className="mt-4">
            <AdminTableHead>
              <AdminTableTh>Email</AdminTableTh>
              <AdminTableTh>Role</AdminTableTh>
              <AdminTableTh>Status</AdminTableTh>
              <AdminTableTh>{t("view")}</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {items.map((u) => (
                <AdminTableRow key={u.id}>
                  <AdminTableTd>{u.email}</AdminTableTd>
                  <AdminTableTd className="capitalize">{u.role.replace("_", " ")}</AdminTableTd>
                  <AdminTableTd>{u.status}</AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/users/${u.id}`} className="text-brand-600">
                      {t("view")}
                    </Link>
                  </AdminTableTd>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminDataTable>
          <AdminPagination
            page={page}
            pageLabel={t("page")}
            prevDisabled={page <= 1}
            nextDisabled={page * PAGE_SIZE >= total}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </AdminListShell>
      </PanelSection>
    </AdminPage>
  );
}
