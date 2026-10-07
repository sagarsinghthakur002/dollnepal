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
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      <div className="space-y-3 lg:col-span-2">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/5 sm:flex-nowrap sm:gap-4 sm:p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream-200 sm:h-20 sm:w-20">
              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>

            <div className="min-w-0 flex-1 basis-[calc(100%-5rem)] sm:basis-auto">
              <Link href={`/product/${item.productId}`} className="font-display text-sm font-semibold text-neutral-900 hover:text-brand-pink-600 line-clamp-2 sm:line-clamp-1">
                {item.name}
              </Link>
              <p className="text-sm text-neutral-500">{formatNPR(item.price)} each</p>
            </div>

            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start sm:gap-4">
              <div className="flex items-center rounded-full border border-neutral-200">
                <button
                  type="button"
                  onClick={() => updateQty(item.productId, item.qty - 1)}
                  className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center text-sm font-semibold text-neutral-800">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.productId, item.qty + 1)}
                  className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="ml-auto text-right text-sm font-bold text-neutral-900 sm:ml-0 sm:w-24 sm:shrink-0">{formatNPR(item.price * item.qty)}</p>

              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.name} from cart`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-3xl bg-white p-4 sm:p-6 shadow-card ring-1 ring-black/5">
        <h2 className="font-display text-lg font-semibold text-neutral-900">Order Summary</h2>
        <div className="mt-4 flex justify-between text-sm text-neutral-600">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900">{formatNPR(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">Delivery charge is calculated at checkout based on weight and region.</p>

        <Link
          href="/checkout"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
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
