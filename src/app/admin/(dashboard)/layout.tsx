import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Package, ClipboardList, LogOut } from "lucide-react";
import { requireAdminSession, signOutAdminAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <div className="mb-4 flex items-center gap-2 px-1">
          <LayoutGrid size={18} className="text-brand-pink-600" />
          <span className="font-display text-sm font-semibold text-neutral-900">
            Admin
          </span>
        </div>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-brand-pink-50 hover:text-brand-pink-600"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <form action={signOutAndRedirect}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-100"
            >
              <LogOut size={16} />
              Log out
            </button>
          </form>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

async function signOutAndRedirect() {
  "use server";
  await signOutAdminAction();
  redirect("/admin/login");
}
