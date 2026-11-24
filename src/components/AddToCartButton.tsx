"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product, qty = 1 }: { product: Product; qty?: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (product.isOutOfStock) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={product.isOutOfStock}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:bg-none disabled:text-neutral-500 disabled:hover:scale-100"
    >
      {added ? <Check size={16} /> : <ShoppingBag size={16} />}
      {product.isOutOfStock ? "Out of Stock" : added ? "Added to cart" : "Add to Cart"}
    </button>
  );
}
