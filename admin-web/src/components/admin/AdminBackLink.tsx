import { Link } from "@/i18n/navigation";

type Props = {
  href: "/admin/users" | "/admin/orders" | "/admin/plans";
  label: string;
};

export function AdminBackLink({ href, label }: Props) {
  return (
    <Link href={href} className="inline-block text-sm text-brand-600 hover:underline">
      ← {label}
    </Link>
  );
}
