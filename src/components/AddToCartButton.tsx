"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Palette } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/types";

const BASE =
  "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-transform hover:scale-[1.03] sm:text-[13px]";

export default function AddToCartButton({ product, qty = 1 }: { product: Product; qty?: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Products with colour options need a colour first, so send the customer to the product page.
  if (product.colors.length > 0 && !product.isOutOfStock) {
    return (
      <Link href={`/product/${product.id}`} className={`${BASE} brand-gradient-bg text-white`}>
        <Palette size={14} />
        Choose colour
      </Link>
    );
  }

  function handleClick() {
    if (product.isOutOfStock) return;
    if (!addItem(product, qty)) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={product.isOutOfStock}
      className={`${BASE} brand-gradient-bg text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:bg-none disabled:text-neutral-500 disabled:hover:scale-100`}
    >
      {added ? <Check size={14} /> : <ShoppingBag size={14} />}
      {product.isOutOfStock ? "Out of Stock" : added ? "Added to cart" : "Add to Cart"}
    </button>
  );
}
