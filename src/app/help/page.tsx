import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import FaqList, { type FaqItem } from "@/components/FaqList";
import { formatNPR } from "@/lib/currency";
import { BASE_WEIGHT_KG, DELIVERY_REGIONS, calculateShippingFee } from "@/lib/shipping";
import { SITE_INFO } from "@/lib/siteInfo";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Help Centre – Ordering, Payment, Delivery & Returns",
  description:
    "How to order from DollNepal, pay with eSewa, Khalti or bank transfer, delivery rates inside and outside Kathmandu Valley, order tracking and returns.",
  alternates: { canonical: "/help" },
};

const FAQ: FaqItem[] = [
  {
    q: "How do I pay for my order?",
    a: "After you place your order you can pay by eSewa, Khalti or bank transfer (Prabhu Bank QR). Scan the QR, pay the full total, upload your payment screenshot and tap “Yes, I've paid”. We check every payment before your parcel is handed to the courier.",
  },
  {
    q: "Can I order on WhatsApp instead?",
    a: "Yes. Every product page has an “Order on WhatsApp” button, and you can message us any time with what you'd like. We'll take your order there.",
  },
  {
    q: "How is the delivery fee calculated?",
    a: `The fee depends on where we deliver and the total weight of your order. The base rate covers up to ${BASE_WEIGHT_KG} kg, and the base rate is added again for every extra 1 kg over ${BASE_WEIGHT_KG} kg. Checkout shows the exact fee before you pay.`,
  },
  {
    q: "Which couriers do you use?",
    a: "We deliver with Nepal Can Move (NCM) and Upaya Services. Once your parcel is dispatched we add the courier and tracking ID to your order, and you can follow it from the Track Order page.",
  },
  {
    q: "How long does delivery take?",
    a: `Usually ${SITE_INFO.deliveryTime.insideValley} inside Kathmandu Valley and ${SITE_INFO.deliveryTime.outsideValley} elsewhere in Nepal, once your payment is confirmed and the parcel is with the courier. Festivals and bad weather can add a day or two.`,
  },
  {
    q: "How do I track my order?",
    a: "Open Track Order and enter your Order ID. You'll see the latest status and the courier's tracking ID.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Message us on WhatsApp as soon as possible with your Order ID. If the parcel hasn't been dispatched yet, we'll do our best to help.",
  },
];

const STEPS = [
  { title: "Add gifts to your cart", body: "Browse the shop and tap Add to Cart on the gifts you like." },
  { title: "Check out", body: "Enter your name, phone number and address, and choose Inside or Outside Kathmandu Valley. The delivery fee is added to your total straight away." },
  { title: "Pay", body: "Pay by eSewa, Khalti or bank transfer, upload your screenshot and tap “Yes, I've paid”. You'll get a thank-you page with your invoice." },
  { title: "Track your parcel", body: "We confirm your payment, hand the parcel to the courier and add the tracking ID. Follow it on the Track Order page." },
];

export default function HelpPage() {
  const weights = [BASE_WEIGHT_KG, 3, 4, 5];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Help centre</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Everything about ordering, paying and getting your gift delivered. Can&apos;t find an answer? Message us on WhatsApp.
        </p>
      </header>

      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["#how-to-order", "How to order"],
          ["#payment", "Payment"],
          ["#delivery", "Delivery rates"],
          ["#tracking", "Tracking"],
          ["#returns", "Returns"],
          ["#faq", "FAQ"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-700 ring-1 ring-neutral-200 hover:ring-brand-pink-300">
            {label}
          </a>
        ))}
      </nav>

      <section id="how-to-order" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">How to order</h2>
        <ol className="mt-5 space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient-bg text-sm font-bold text-white">{i + 1}</span>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-neutral-500">
          Prefer to chat? Tap <strong>Order on WhatsApp</strong> on any product and we&apos;ll take your order there.
        </p>
      </section>

      <section id="payment" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Payment</h2>
        <div className="mt-5 rounded-2xl bg-white p-5 text-sm leading-relaxed text-neutral-600 ring-1 ring-black/5">
          <p>
            We accept <strong className="text-neutral-900">eSewa</strong>, <strong className="text-neutral-900">Khalti</strong> and{" "}
            <strong className="text-neutral-900">bank transfer (Prabhu Bank QR)</strong>. After placing your order, scan the QR on your order page,
            pay the full total, upload your payment screenshot and tap <strong>Yes, I&apos;ve paid</strong>.
          </p>
          <p className="mt-3">We check every payment in our account before your parcel is handed to the courier.</p>
        </div>
      </section>

      <section id="delivery" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Delivery rates</h2>
        <p className="mt-2 text-sm text-neutral-600">
          We deliver with Nepal Can Move (NCM) and Upaya Services. The base rate covers up to {BASE_WEIGHT_KG} kg; the base rate is added again for
          every extra 1 kg over {BASE_WEIGHT_KG} kg.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-brand-cream-100 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order weight</th>
                {DELIVERY_REGIONS.map((r) => (
                  <th key={r.value} className="px-5 py-3 font-semibold">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {weights.map((kg) => (
                <tr key={kg}>
                  <td className="px-5 py-3 text-neutral-600">{kg === BASE_WEIGHT_KG ? `Up to ${kg} kg` : `${kg} kg`}</td>
                  {DELIVERY_REGIONS.map((r) => (
                    <td key={r.value} className="px-5 py-3 font-semibold text-neutral-900">{formatNPR(calculateShippingFee(r.value, kg))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-neutral-500">
          Checkout shows the exact fee for your cart. Usually {SITE_INFO.deliveryTime.insideValley} inside Kathmandu Valley and{" "}
          {SITE_INFO.deliveryTime.outsideValley} elsewhere in Nepal.
        </p>
      </section>

      <section id="tracking" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Tracking</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Enter your Order ID (it looks like DN-XXXXXXXXX) on the Track Order page. Once your parcel is with
          the courier, you&apos;ll also see the courier name and tracking ID, with a button to open the courier&apos;s own tracking page.
        </p>
        <Link href="/track" className="mt-4 inline-flex min-h-11 items-center rounded-full brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white">
          Track my order
        </Link>
      </section>

      <section id="returns" className="mt-12 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Returns</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">
          {SITE_INFO.returns.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section id="faq" className="mt-12 scroll-mt-28">
        <h2 className="mb-5 font-display text-2xl font-semibold text-neutral-900">Questions</h2>
        <FaqList items={FAQ} />
      </section>

      <section className="mt-12 rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-black/5">
        <h2 className="font-display text-xl font-semibold text-neutral-900">Still have a question?</h2>
        <p className="mt-1 text-sm text-neutral-500">Message us on WhatsApp and we&apos;ll help with your order.</p>
        <a
          href={buildGeneralWhatsAppLink("Hello DollNepal! I have a question about ordering.")}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white sm:w-auto"
        >
          <MessageCircle size={18} /> Message us on WhatsApp
        </a>
        <p className="mt-3 text-xs text-neutral-400">{SITE_INFO.hours}</p>
      </section>
    </main>
  );
}
