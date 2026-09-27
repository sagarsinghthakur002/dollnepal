"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product, qty = 1 }: { product: Product; qty?: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
    >
      {added ? <Check size={16} /> : <ShoppingBag size={16} />}
      {added ? "Added to cart" : "Add to Cart"}
    </button>
  );
}
