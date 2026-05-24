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
    <dl className="grid sm:grid-cols-2 gap-3 text-sm">
      {items.map((item, i) => (
        <div key={i} className={item.className}>
          <dt className="text-[var(--muted)]">{item.label}</dt>
          <dd className="mt-0.5">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
