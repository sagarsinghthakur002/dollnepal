"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { createOrderAction } from "@/lib/actions/orders";
import { formatNPR } from "@/lib/currency";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await createOrderAction(items, { name, phone, location });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clear();
      router.push(`/order/${result.orderId}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-card ring-1 ring-black/5">
        <p className="font-display text-lg font-semibold text-neutral-800">Your cart is empty</p>
        <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-brand-purple-600 hover:underline">
          Go find something cute →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 lg:col-span-2 sm:p-8">
        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <div>
          <label htmlFor="co-name" className="mb-1 block text-xs font-semibold text-neutral-600">Full name</label>
          <input
            id="co-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="co-phone" className="mb-1 block text-xs font-semibold text-neutral-600">Phone number</label>
          <input
            id="co-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXX"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="co-location" className="mb-1 block text-xs font-semibold text-neutral-600">Delivery address / location</label>
          <textarea
            id="co-location"
            required
            rows={3}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="House no., street, ward, city"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full brand-gradient-bg px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? "Placing order…" : "Place Order"}
        </button>
      </form>

      <aside className="h-fit rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
        <h2 className="font-display text-lg font-semibold text-neutral-900">Order Summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-cream-200">
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800">{item.name}</p>
                <p className="text-xs text-neutral-500">Qty {item.qty}</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900">{formatNPR(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-neutral-100 pt-4 text-sm font-bold text-neutral-900">
          <span>Total</span>
          <span>{formatNPR(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
