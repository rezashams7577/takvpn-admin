type Props = {
  label: string;
  value: string | number;
};

export function AdminStatCard({ label, value }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
