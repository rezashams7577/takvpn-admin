import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function AdminPage({ children, className = "" }: Props) {
  return (
    <div className={`max-w-3xl w-full space-y-6 ${className}`.trim()}>{children}</div>
  );
}
