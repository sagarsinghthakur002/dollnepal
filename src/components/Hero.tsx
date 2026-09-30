import Link from "next/link";
import Image from "next/image";
import { Sparkles, MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-cream-100">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-pink-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-brand-purple-200/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-20 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-purple-600 shadow-card ring-1 ring-brand-purple-100">
            <Sparkles size={14} className="text-brand-gold-500" />
            Nepal&apos;s cutest gifting spot
          </span>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl">
            Gifts that say <span className="brand-gradient-text">it, cutely.</span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-600">
            Premium dolls, fresh bouquets, curated gift boxes and combo hampers —
            handpicked in Kathmandu, delivered across Nepal via Nepal Can Move, or
            shipped with love to the Nepali diaspora abroad.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
            >
              Explore the Shop
            </Link>
            <a
              href={buildGeneralWhatsAppLink("Hello DollNepal! I would like to know more about your gifts and dolls.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-purple-200 bg-white px-7 py-3.5 text-sm font-semibold text-brand-purple-700 transition-colors hover:border-brand-purple-400"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-neutral-500">
            <div>
              <p className="font-display text-2xl font-semibold text-neutral-900">500+</p>
              <p>Happy customers</p>
            </div>
            <div className="h-8 w-px bg-brand-pink-200" />
            <div>
              <p className="font-display text-2xl font-semibold text-neutral-900">4.9★</p>
              <p>Loved on Instagram</p>
            </div>
            <div className="h-8 w-px bg-brand-pink-200" />
            <div>
              <p className="font-display text-2xl font-semibold text-neutral-900">Nepal-wide</p>
              <p>&amp; diaspora shipping</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-md">
          <div className="absolute inset-0 -z-10 rounded-[2.5rem] brand-gradient-bg opacity-90 blur-[2px]" />
          <div className="rounded-[2.5rem] border-4 border-white bg-white p-3 shadow-soft">
            <Image
              src="/roshani.jpeg"
              alt="DollNepal — cute gifts, dolls and love"
              width={480}
              height={480}
              className="aspect-square w-full rounded-[2rem] object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-brand-gold-200 sm:-left-8">
            <p className="text-xs font-semibold text-brand-gold-600">🔥 Trending now</p>
            <p className="font-display text-sm font-semibold text-neutral-800">See what&apos;s hot →</p>
          </div>
        </div>
      </div>
    </section>
  );
}
