import Link from "next/link";
import { Package, ClipboardList, Flame, Clock } from "lucide-react";
import { getAllProducts } from "@/lib/data/products";
import { getAllOrders } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [products, orders] = await Promise.all([getAllProducts(), getAllOrders()]);
  const trendingCount = products.filter((p) => p.trending).length;
  const pendingVerification = orders.filter((o) => o.paymentStatus === "pending_verification").length;

  const cards = [
    { label: "Products", value: products.length, icon: Package, href: "/admin/products" },
    { label: "Trending", value: trendingCount, icon: Flame, href: "/admin/products" },
    { label: "Orders", value: orders.length, icon: ClipboardList, href: "/admin/orders" },
    { label: "Awaiting payment verification", value: pendingVerification, icon: Clock, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Overview of your store.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
          >
            <Icon size={18} className="text-brand-pink-600" />
            <p className="mt-3 font-display text-2xl font-semibold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
