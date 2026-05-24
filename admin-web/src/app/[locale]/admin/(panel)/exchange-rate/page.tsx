"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { adminSetExchangeRate } from "@/lib/admin-api";
import { fetchExchangeRate } from "@/lib/api";
import { formatExchangeRate } from "@/lib/format";

export default function AdminExchangeRatePage() {
  const t = useTranslations("adminPanel");
  const [rate, setRate] = useState("");
  const [current, setCurrent] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCurrent() {
    try {
      const e = await fetchExchangeRate();
      setCurrent(e.usdt_irr);
      setRate(e.usdt_irr);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadCurrent();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await adminSetExchangeRate(String(fd.get("rate")));
      setMsg(t("exchangeRateUpdated"));
      setCurrent(String(fd.get("rate")));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("exchangeRateTitle")}</h1>
      {current && (
        <p className="text-sm text-[var(--muted)] mt-2">
          {t("exchangeRateCurrent", { rate: formatExchangeRate(current) })}
        </p>
      )}
      <form onSubmit={onSubmit} className="admin-form mt-6 max-w-sm space-y-3" dir="ltr">
        <FormField
          label={t("exchangeRateLabel")}
          name="rate"
          required
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        {msg && <FormMessage variant="success">{msg}</FormMessage>}
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit loading={loading}>{t("exchangeRateUpdate")}</FormSubmit>
      </form>
    </div>
  );
}
