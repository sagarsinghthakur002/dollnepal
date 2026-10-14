import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, ArrowRight } from "lucide-react";
import DownloadInvoiceButton from "@/components/order/DownloadInvoiceButton";
import { formatNPR } from "@/lib/currency";
import { getOrderById } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you for your order",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();
  // Only show the thank-you page once payment has actually been submitted.
  if (order.paymentStatus === "unpaid") redirect(`/order/${order.orderId}`);

  const verified = order.paymentStatus === "paid";

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-black/5 sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <BadgeCheck size={36} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Thank you, {order.customer.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {verified
            ? "Your payment is confirmed and your order is being processed."
            : "We've received your payment confirmation. We'll verify it shortly and message you on WhatsApp."}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-brand-cream-100 p-4 text-left text-sm">
          <div>
            <dt className="text-xs text-neutral-500">Order ID</dt>
            <dd className="break-all font-semibold text-neutral-900">{order.orderId}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Total paid</dt>
            <dd className="font-semibold text-neutral-900">{formatNPR(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <DownloadInvoiceButton order={order} />
          <p className="mt-2 text-xs text-neutral-400">Saves a PDF receipt of your order to your device.</p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/track?orderId=${order.orderId}`}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Track this order <ArrowRight size={14} />
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
