import type { ReactNode } from "react";

export type AdminMetaItem = {
  label: string;
  value: ReactNode;
  className?: string;
};

type Props = {
  items: AdminMetaItem[];
};

export function AdminMetaGrid({ items }: Props) {
  return (
    <dl className="space-y-4 text-sm">
      {items.map((item, i) => (
        <div key={i} className={item.className}>
          <dt className="text-xs text-[var(--muted)]">{item.label}</dt>
          <dd className="mt-1 font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
