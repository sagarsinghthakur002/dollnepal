"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatNPR } from "@/lib/currency";

export default function CartView() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-card ring-1 ring-black/5">
        <ShoppingBag size={36} className="mx-auto text-neutral-300" />
        <p className="mt-4 font-display text-lg font-semibold text-neutral-800">Your cart is empty</p>
        <p className="mt-1 text-sm text-neutral-500">Add a few cute things to get started.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full brand-gradient-bg px-7 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-cream-200">
              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.productId}`} className="font-display text-sm font-semibold text-neutral-900 hover:text-brand-pink-600 line-clamp-1">
                {item.name}
              </Link>
              <p className="text-sm text-neutral-500">{formatNPR(item.price)} each</p>
            </div>

            <div className="flex items-center rounded-full border border-neutral-200">
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.qty - 1)}
                className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus size={14} />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-neutral-800">{item.qty}</span>
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.qty + 1)}
                className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus size={14} />
              </button>
            </div>

            <p className="w-24 shrink-0 text-right text-sm font-bold text-neutral-900">{formatNPR(item.price * item.qty)}</p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              aria-label={`Remove ${item.name} from cart`}
              className="shrink-0 rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
        <h2 className="font-display text-lg font-semibold text-neutral-900">Order Summary</h2>
        <div className="mt-4 flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900">{formatNPR(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">Delivery fee confirmed on WhatsApp after checkout.</p>

        <Link
          href="/checkout"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
        >
          Proceed to Checkout
        </Link>
        <Link href="/shop" className="mt-3 block text-center text-xs font-semibold text-brand-purple-600 hover:underline">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
