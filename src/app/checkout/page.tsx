import type { Metadata } from "next";
import CheckoutForm from "@/components/cart/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-3xl font-semibold text-neutral-900">Checkout</h1>
      <p className="mb-8 text-sm text-neutral-500">Tell us where to send your order.</p>
      <CheckoutForm />
    </main>
  );
}
