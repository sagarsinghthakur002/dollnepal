"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, LogOut, PackageSearch, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { formatNPR } from "@/lib/currency";
import type { Order, PaymentStatus, ShippingStatus } from "@/lib/types";

const PAYMENT_LABELS: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: { label: "Payment due", className: "bg-amber-50 text-amber-700" },
  pending_verification: { label: "Verifying payment", className: "bg-blue-50 text-blue-700" },
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700" },
  refunded: { label: "Refunded", className: "bg-neutral-100 text-neutral-600" },
};

const SHIPPING_LABELS: Record<ShippingStatus, string> = {
  processing: "Processing",
  dispatched: "Dispatched",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kathmandu" });
}

export default function AccountOrders() {
  const { user, loading, openSignIn, signOut, getIdToken } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch("/api/my-orders", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { orders: Order[] };
      setOrders(data.orders);
    } catch {
      setError("Couldn't load your orders. Please try again.");
    }
  }, [getIdToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on sign-in
    if (user) load();
    else setOrders(null);
  }, [user, load]);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-neutral-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-card ring-1 ring-black/5">
        <PackageSearch className="mx-auto text-brand-pink-500" size={36} />
        <h1 className="mt-3 font-display text-xl font-semibold text-neutral-900">Sign in to see your orders</h1>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-neutral-500">Your shopping history is saved to your Google or Apple account.</p>
        <button
          type="button"
          onClick={() => openSignIn("Sign in to see your orders and shopping history.")}
          className="mt-5 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-soft"
        >
          Sign in
        </button>
      </div>
    );
  }

  const totalSpent = (orders ?? []).filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-neutral-900">My orders</h1>
          <p className="truncate text-sm text-neutral-500">{user.displayName || user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-neutral-500 ring-1 ring-neutral-200 hover:bg-neutral-50"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}{" "}
          <button type="button" onClick={load} className="font-semibold underline">
            Retry
          </button>
        </p>
      )}

      {orders === null && !error && (
        <div className="flex justify-center py-20 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="mt-6 rounded-3xl bg-white px-6 py-14 text-center shadow-card ring-1 ring-black/5">
          <ShoppingBag className="mx-auto text-brand-pink-500" size={36} />
          <p className="mt-3 font-display text-lg font-semibold text-neutral-800">No orders yet</p>
          <p className="mt-1 text-sm text-neutral-500">When you place an order it will show up here.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-brand-purple-600 hover:underline">
            Go find something cute →
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
              <p className="text-xs text-neutral-500">Orders placed</p>
              <p className="font-display text-xl font-semibold text-neutral-900">{orders.length}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
              <p className="text-xs text-neutral-500">Total paid</p>
              <p className="font-display text-xl font-semibold text-neutral-900">{formatNPR(totalSpent)}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-4">
            {orders.map((order) => {
              const pay = PAYMENT_LABELS[order.paymentStatus];
              const shown = order.items.slice(0, 3);
              const more = order.items.length - shown.length;
              return (
                <li key={order.orderId} className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-black/5 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-all font-display text-sm font-semibold text-neutral-900">#{order.orderId}</p>
                      <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${pay.className}`}>{pay.label}</span>
                      <span className="rounded-full bg-brand-cream-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                        {SHIPPING_LABELS[order.shippingStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {shown.map((item) => (
                      <div key={item.productId} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-cream-200">
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                        {item.qty > 1 && (
                          <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/60 px-1 text-[10px] font-semibold text-white">×{item.qty}</span>
                        )}
                      </div>
                    ))}
                    {more > 0 && <span className="text-xs font-semibold text-neutral-500">+{more} more</span>}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{order.items.map((i) => i.name).join(", ")}</p>

                  <div className="mt-3 flex flex-col gap-3 border-t border-neutral-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-neutral-500">
                      Total <span className="font-display text-base font-semibold text-neutral-900">{formatNPR(order.total)}</span>
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/order/${order.orderId}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white"
                      >
                        {order.paymentStatus === "unpaid" ? "Pay now" : "View order & invoice"}
                      </Link>
                      <Link
                        href={`/track?orderId=${order.orderId}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
