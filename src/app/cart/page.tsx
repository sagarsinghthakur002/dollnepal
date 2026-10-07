import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-semibold text-neutral-900">Your Cart</h1>
      <CartView />
    </main>
  );
}
