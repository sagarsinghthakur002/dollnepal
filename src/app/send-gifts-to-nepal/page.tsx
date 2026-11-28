import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import FaqList, { type FaqItem } from "@/components/FaqList";
import ProductGrid from "@/components/ProductGrid";
import { getAllProducts } from "@/lib/data/products";
import { SITE_INFO } from "@/lib/siteInfo";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Send Gifts to Nepal from Abroad",
  description:
    "Living abroad? Send dolls, bouquets, gift boxes and combo hampers to your family in Nepal. Pay from anywhere and we deliver anywhere in Nepal.",
  alternates: { canonical: "/send-gifts-to-nepal" },
};

const FAQ: FaqItem[] = [
  {
    q: "Can I pay from abroad?",
    a: "Yes. Message us on WhatsApp and we'll share the payment options that work from your country, such as bank transfer or remittance. Then send us the payment screenshot so we can confirm it.",
  },
  {
    q: "Does the receiver have to pay anything?",
    a: "No. Orders are paid online before dispatch, so the receiver never pays anything when the parcel arrives.",
  },
  {
    q: "What do you need from me?",
    a: "The receiver's name, a phone number that answers, and their delivery address. The courier uses that number to arrange delivery.",
  },
  {
    q: "How long does delivery take?",
    a: `Usually ${SITE_INFO.deliveryTime.insideValley} inside Kathmandu Valley and ${SITE_INFO.deliveryTime.outsideValley} elsewhere in Nepal, once your payment is confirmed. Festivals and bad weather can add a day or two.`,
  },
  {
    q: "Can I track the parcel?",
    a: "Yes. On the Track Order page, enter the Order ID. You'll see the courier and tracking ID once it is dispatched.",
  },
];

const STEPS = [
  { title: "Choose a gift", body: "Add it to your cart and enter the receiver's name, phone and delivery address at checkout." },
  { title: "Pay in full", body: "Pay by bank transfer or remittance, or eSewa / Khalti. Message us on WhatsApp if you need payment details." },
  { title: "Send the screenshot", body: "Upload the payment screenshot on your order page or send it on WhatsApp. We confirm it, check the gift and pack it." },
  { title: "We deliver in Nepal", body: "Nepal Can Move or Upaya takes it to the receiver's door, using their phone number to arrange delivery." },
];

export default async function SendGiftsPage() {
  const products = (await getAllProducts()).filter((p) => !p.isOutOfStock);
  const popular = [...products.filter((p) => p.trending), ...products.filter((p) => !p.trending)].slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Send gifts to Nepal from abroad</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Living in Australia, the UK, the US, Japan, the Gulf or anywhere else, and want to surprise someone at home? Choose a gift here, tell us
          the receiver&apos;s name and phone number, and we&apos;ll deliver it anywhere in Nepal. Pay the full amount upfront, then send the payment
          screenshot — the receiver never pays anything.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-full brand-gradient-bg px-7 py-3 text-sm font-semibold text-white shadow-soft">
            Shop gifts
          </Link>
          <a
            href={buildGeneralWhatsAppLink("Hello DollNepal! I'm abroad and want to send a gift to my family in Nepal.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle size={18} /> Message us on WhatsApp
          </a>
        </div>
      </header>

      {popular.length > 0 && (
        <section className="mt-14" aria-labelledby="popular-heading">
          <div className="mb-5 flex items-end justify-between">
            <h2 id="popular-heading" className="font-display text-2xl font-semibold text-neutral-900">Popular gifts to send</h2>
            <Link href="/shop" className="text-sm font-semibold text-neutral-700 hover:text-brand-pink-600">See all →</Link>
          </div>
          <ProductGrid products={popular} />
        </section>
      )}

      <section className="mt-14" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="font-display text-2xl font-semibold text-neutral-900">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient-bg text-sm font-bold text-white">{i + 1}</span>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 max-w-3xl" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mb-5 font-display text-2xl font-semibold text-neutral-900">Questions</h2>
        <FaqList items={FAQ} />
      </section>
    </main>
  );
}
