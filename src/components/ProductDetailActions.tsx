"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/types";

export default function ProductDetailActions({
  product,
  color,
  colorImage,
}: {
  product: Product;
  /** Selected colour name (null if none chosen / product has no colours). */
  color: string | null;
  colorImage: string | null;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [needColor, setNeedColor] = useState(false);

  const hasColors = product.colors.length > 0;

  function handleAdd() {
    if (product.isOutOfStock) return;
    if (hasColors && !color) {
      setNeedColor(true);
      return;
    }
    setNeedColor(false);
    const ok = addItem(product, qty, color ? { color, image: colorImage ?? product.imageUrl } : undefined);
    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 4000);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`flex shrink-0 items-center rounded-full border border-neutral-200 ${product.isOutOfStock ? "pointer-events-none opacity-50" : ""}`}>
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-10 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-neutral-800">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-11 w-10 items-center justify-center text-neutral-600 hover:text-brand-pink-600"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.isOutOfStock}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:bg-none disabled:text-neutral-500 disabled:shadow-none disabled:hover:scale-100 sm:flex-none sm:px-8"
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {product.isOutOfStock ? "Out of Stock" : added ? "Added to cart" : "Add to Cart"}
        </button>
      </div>

      {needColor && <p className="mt-3 text-sm font-semibold text-red-600">Please choose a colour first.</p>}

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
