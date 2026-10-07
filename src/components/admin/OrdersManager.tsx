"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { formatNPR } from "@/lib/currency";
import { COURIERS, isCourier, type Courier } from "@/lib/couriers";
import { regionLabel } from "@/lib/shipping";
import type { Order, PaymentStatus, ShippingStatus } from "@/lib/types";

const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "pending_verification", "paid", "refunded"];
const SHIPPING_STATUSES: ShippingStatus[] = [
  "processing",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  unpaid: "bg-neutral-100 text-neutral-600",
  pending_verification: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  refunded: "bg-red-100 text-red-700",
};

export default function OrdersManager({ orders }: { orders: Order[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">Orders</h1>
        <p className="mt-1 text-sm text-neutral-500">{orders.length} orders placed</p>
      </div>

      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-neutral-500 ring-1 ring-black/5">
            No orders yet.
          </p>
        )}

        {orders.map((order) => {
          const isOpen = expanded === order.orderId;
          return (
            <div key={order.orderId} className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : order.orderId)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-neutral-900">{order.orderId}</p>
                  <p className="text-xs text-neutral-500">
                    {order.customer.name} · {order.customer.phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_BADGE[order.paymentStatus]}`}>
                    {order.paymentStatus.replace("_", " ")}
                  </span>
                  <span className="rounded-full bg-brand-purple-50 px-2.5 py-1 text-xs font-semibold text-brand-purple-600">
                    {order.shippingStatus.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-bold text-neutral-800">{formatNPR(order.total)}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isOpen && <OrderDetail order={order} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [shippingStatus, setShippingStatus] = useState(order.shippingStatus);
  const [ncmTrackingId, setNcmTrackingId] = useState(order.ncmTrackingId ?? "");
  const [courier, setCourier] = useState<Courier | "">(order.courier ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateOrderStatusAction(order.orderId, {
        paymentStatus,
        shippingStatus,
        courier: isCourier(courier) ? courier : null,
        ncmTrackingId: ncmTrackingId.trim() || null,
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-neutral-100 bg-brand-cream-100/60 px-5 py-5">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Delivery details</h3>
          <p className="mt-2 text-sm text-neutral-700">{order.customer.name}</p>
          <p className="text-sm text-neutral-700">{order.customer.phone}</p>
          <p className="text-sm text-neutral-700">{order.customer.location}</p>

          {order.paymentProofUrl && (
            <>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Payment proof</h3>
              <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary customer-uploaded blob */}
                <img src={order.paymentProofUrl} alt="Payment screenshot" className="max-h-48 rounded-xl ring-1 ring-black/10" />
              </a>
            </>
          )}

          <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Items</h3>
          <ul className="mt-2 space-y-1 text-sm text-neutral-700">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span>{item.name} × {item.qty}</span>
                <span className="font-medium">{formatNPR(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-sm text-neutral-600">
            <span>Delivery ({regionLabel(order.deliveryRegion)}, {order.totalWeight} kg)</span>
            <span className="font-medium">{formatNPR(order.deliveryCharge)}</span>
          </p>
          <p className="mt-1 flex justify-between text-sm font-bold text-neutral-900">
            <span>Total</span>
            <span>{formatNPR(order.total)}</span>
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Update status</h3>

          <div className="mt-2 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Payment status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-brand-pink-400 focus:outline-none"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Shipping status</label>
              <select
                value={shippingStatus}
                onChange={(e) => setShippingStatus(e.target.value as ShippingStatus)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-brand-pink-400 focus:outline-none"
              >
                {SHIPPING_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Courier partner</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value as Courier | "")}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-brand-pink-400 focus:outline-none"
              >
                <option value="">Not assigned</option>
                {COURIERS.map((c) => (
                  <option key={c.value} value={c.value}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Courier tracking ID <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                type="text"
                value={ncmTrackingId}
                onChange={(e) => setNcmTrackingId(e.target.value)}
                placeholder="e.g. AWB-102938"
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-brand-pink-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
