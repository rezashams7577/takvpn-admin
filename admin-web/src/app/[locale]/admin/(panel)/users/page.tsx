"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminListShell } from "@/components/admin/AdminListShell";
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
    <div>
      <h1 className="text-2xl font-bold">{t("users")}</h1>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load(q, 1);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">
          Search
        </button>
      </form>
      <p className="text-sm text-[var(--muted)] mt-2">{total} users</p>
      <AdminListShell loading={loading} error={err} empty={!loading && !err && items.length === 0}>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[var(--muted)]">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4 capitalize">{u.role.replace("_", " ")}</td>
                  <td className="py-3 pr-4">{u.status}</td>
                  <td className="py-3">
                    <Link href={`/admin/users/${u.id}`} className="text-brand-600">
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm py-1">
            {t("page")} {page}
          </span>
          <button
            disabled={page * PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </AdminListShell>
    </div>
  );
}
