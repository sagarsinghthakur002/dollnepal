"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getFinalPrice, hasDiscount } from "@/lib/pricing";
import type { CartItem, Product } from "@/lib/types";

const STORAGE_KEY = "dollnepal_cart";

/** Same product in two colours = two separate cart lines. */
export function cartItemKey(item: { productId: string; color?: string }): string {
  return item.color ? `${item.productId}::${item.color}` : item.productId;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** Returns true if the item was added; false if blocked (out of stock). */
  addItem: (product: Product, qty?: number, variant?: { color: string; image: string }) => boolean;
  updateQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage during render would desync server/client HTML
    // (SSR has no localStorage), so the cart intentionally renders empty on
    // both the server and the client's first pass, then hydrates here.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private browsing, etc.) — cart stays in-memory
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, qty = 1, variant?: { color: string; image: string }): boolean => {
    if (product.isOutOfStock) return false; // out-of-stock products can never enter the cart
    const discounted = hasDiscount(product.discountPercent);
    const key = cartItemKey({ productId: product.id, color: variant?.color });
    setItems((prev) => {
      if (prev.some((i) => cartItemKey(i) === key)) {
        return prev.map((i) => (cartItemKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: getFinalPrice(product.price, product.discountPercent),
          ...(discounted ? { originalPrice: product.price, discountPercent: product.discountPercent } : {}),
          ...(variant ? { color: variant.color } : {}),
          weight: product.weight,
          image: variant?.image ?? product.imageUrl,
          qty,
        },
      ];
    });
    return true;
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => cartItemKey(i) !== key) : prev.map((i) => (cartItemKey(i) === key ? { ...i, qty } : i))
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: items.reduce((sum, i) => sum + i.qty * i.price, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
