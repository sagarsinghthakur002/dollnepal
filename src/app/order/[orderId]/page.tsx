import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PaymentTabs from "@/components/order/PaymentTabs";
import WhatsAppInvoiceButton from "@/components/order/WhatsAppInvoiceButton";
import { formatNPR } from "@/lib/currency";
import { getOrderById } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Summary",
  robots: { index: false, follow: false },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  const orderUrl = `${SITE_URL}/order/${order.orderId}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple-600">Order placed successfully</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-neutral-900">{order.orderId}</h1>
        <Link href={`/track?orderId=${order.orderId}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-pink-600 hover:underline">
          Track this order <ArrowRight size={14} />
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-neutral-900">Items</h2>
            <ul className="mt-4 divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 py-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream-200">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">{item.name}</p>
                    <p className="text-xs text-neutral-500">{formatNPR(item.price)} × {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-neutral-900">{formatNPR(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between border-t border-neutral-100 pt-4 font-display text-lg font-semibold text-neutral-900">
              <span>Total Payable</span>
              <span>{formatNPR(order.total)}</span>
            </p>
          </article>

          <aside className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-neutral-900">Delivery details</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex gap-2"><dt className="w-24 shrink-0 text-neutral-500">Name</dt><dd className="text-neutral-800">{order.customer.name}</dd></div>
              <div className="flex gap-2"><dt className="w-24 shrink-0 text-neutral-500">Phone</dt><dd className="text-neutral-800">{order.customer.phone}</dd></div>
              <div className="flex gap-2"><dt className="w-24 shrink-0 text-neutral-500">Location</dt><dd className="text-neutral-800">{order.customer.location}</dd></div>
            </dl>
          </aside>

          <WhatsAppInvoiceButton order={order} orderUrl={orderUrl} />
        </div>

        <div>
          <PaymentTabs orderId={order.orderId} paymentStatus={order.paymentStatus} />
        </div>
      </div>
    </main>
  );
}
