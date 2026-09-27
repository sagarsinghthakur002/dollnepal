import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import TrackForm from "@/components/track/TrackForm";
import TrackingTimeline from "@/components/track/TrackingTimeline";
import { formatNPR } from "@/lib/currency";
import { getOrderById, findOrdersByPhone } from "@/lib/data/orders";
import { getTrackingSteps } from "@/lib/ncm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your DollNepal order by Order ID or phone number — live status via Nepal Can Move (NCM).",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; phone?: string }>;
}) {
  const { orderId, phone } = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <PackageSearch size={28} className="mx-auto text-brand-pink-600" />
        <h1 className="mt-2 font-display text-3xl font-semibold text-neutral-900">Track Your Order</h1>
        <p className="mt-2 text-sm text-neutral-500">Enter your Order ID or phone number to see the latest status.</p>
      </header>

      <TrackForm defaultValue={orderId ?? phone ?? ""} />

      <div className="mt-10">
        {orderId && <OrderResult orderId={orderId} />}
        {!orderId && phone && <PhoneResults phone={phone} />}
      </div>
    </main>
  );
}

async function OrderResult({ orderId }: { orderId: string }) {
  const order = await getOrderById(orderId);
  if (!order) {
    return <NotFoundMessage />;
  }

  const { steps, isLive } = await getTrackingSteps(order);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-neutral-900">{order.orderId}</p>
          <p className="text-xs text-neutral-500">{order.customer.name} · {formatNPR(order.total)}</p>
        </div>
        <Link href={`/order/${order.orderId}`} className="text-xs font-semibold text-brand-purple-600 hover:underline">
          View full order →
        </Link>
      </div>
      <TrackingTimeline steps={steps} isLive={isLive} />
    </div>
  );
}

async function PhoneResults({ phone }: { phone: string }) {
  const orders = await findOrdersByPhone(phone);
  if (orders.length === 0) {
    return <NotFoundMessage />;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.orderId}
          href={`/track?orderId=${order.orderId}`}
          className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <p className="font-display text-sm font-semibold text-neutral-900">{order.orderId}</p>
            <p className="text-xs text-neutral-500">
              {new Date(order.createdAt).toLocaleDateString("en-GB")} · {formatNPR(order.total)}
            </p>
          </div>
          <span className="rounded-full bg-brand-purple-50 px-3 py-1 text-xs font-semibold text-brand-purple-600">
            {order.shippingStatus.replace(/_/g, " ")}
          </span>
        </Link>
      ))}
    </div>
  );
}

function NotFoundMessage() {
  return (
    <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-neutral-500 ring-1 ring-black/5">
      We couldn&apos;t find an order matching that. Double-check your Order ID or phone number.
    </p>
  );
}
