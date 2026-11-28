import type { Metadata } from "next";
import { SITE_INFO } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "The terms that apply when you order from DollNepal.",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Terms of Sale</h1>
      <p className="mt-2 text-xs text-neutral-400">Last updated: November 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-600 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <section>
          <h2>Prices and payment</h2>
          <ul>
            <li>Prices are in Nepali rupees (NPR) and can change. The price shown at checkout is the price you pay, including any discount shown.</li>
            <li>An order is confirmed once we see your payment in our account.</li>
            <li>Delivery fees depend on the delivery area and the total weight of your order and are shown before you pay.</li>
          </ul>
        </section>
        <section>
          <h2>Delivery</h2>
          <p>We deliver within Nepal with Nepal Can Move and Upaya Services. Delivery usually takes {SITE_INFO.deliveryTime.insideValley} inside Kathmandu Valley and {SITE_INFO.deliveryTime.outsideValley} elsewhere, once payment is confirmed. Festivals, weather and courier delays can add time.</p>
        </section>
        <section>
          <h2>Products</h2>
          <p>Product colours on screen can look slightly different from the real item. Items marked Out of Stock can&apos;t be ordered.</p>
        </section>
        <section>
          <h2>Returns and damaged items</h2>
          {SITE_INFO.returns.map((line) => (
            <p key={line} className="mt-2">{line}</p>
          ))}
        </section>
        <section>
          <h2>Contact</h2>
          <p>Questions? Email dollnepal.np@gmail.com or message us on WhatsApp. {SITE_INFO.location}.</p>
        </section>
      </div>
    </main>
  );
}
