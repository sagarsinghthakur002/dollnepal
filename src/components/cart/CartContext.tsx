"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth, PENDING_CART_KEY } from "@/components/auth/AuthContext";
import { getFinalPrice, hasDiscount } from "@/lib/pricing";
import type { CartItem, Product } from "@/lib/types";

const STORAGE_KEY = "dollnepal_cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** Returns true if the item was added; false if it was blocked (out of stock) or sign-in is required first. */
  addItem: (product: Product, qty?: number) => boolean;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user, loading: authLoading, openSignIn } = useAuth();

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

  const addItemCore = useCallback((product: Product, qty = 1) => {
    if (product.isOutOfStock) return; // out-of-stock products can never enter the cart
    const discounted = hasDiscount(product.discountPercent);
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: getFinalPrice(product.price, product.discountPercent),
          ...(discounted ? { originalPrice: product.price, discountPercent: product.discountPercent } : {}),
          weight: product.weight,
          image: product.imageUrl,
          qty,
        },
      ];
    });
  }, []);

  // Adding to the cart requires a signed-in customer (so orders show up in their history).
  const addItem = useCallback(
    (product: Product, qty = 1): boolean => {
      if (product.isOutOfStock) return false;
      if (!user) {
        try {
          sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify({ product, qty, at: Date.now() }));
        } catch {
          /* ignore */
        }
        if (!authLoading) openSignIn("Sign in to add items to your cart and track your orders.");
        return false;
      }
      addItemCore(product, qty);
      return true;
    },
    [user, authLoading, openSignIn, addItemCore]
  );

  // After signing in, add the product the customer originally tapped "Add to Cart" on.
  useEffect(() => {
    if (authLoading || !user || !hydrated) return;
    try {
      const raw = sessionStorage.getItem(PENDING_CART_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_CART_KEY);
      const pending = JSON.parse(raw) as { product: Product; qty: number; at: number };
      if (pending?.product && Date.now() - pending.at < 10 * 60 * 1000) {
        addItemCore(pending.product, pending.qty || 1);
      }
    } catch {
      /* ignore */
    }
  }, [user, authLoading, hydrated, addItemCore]);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
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
