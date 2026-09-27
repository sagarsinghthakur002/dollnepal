"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/types";

export default function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-neutral-200">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-neutral-800">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {added ? "Added to cart" : "Add to Cart"}
        </button>
      </div>

      {added && (
        <p className="mt-3 text-sm text-neutral-500">
          Nice choice!{" "}
          <Link href="/cart" className="font-semibold text-brand-purple-600 hover:underline">
            View cart &amp; checkout →
          </Link>
        </p>
      )}
    </div>
  );
}
