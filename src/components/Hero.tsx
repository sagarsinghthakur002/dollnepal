import Link from "next/link";
import Image from "next/image";
import { Sparkles, MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import { HERO_FALLBACK_COLOR } from "@/lib/constants";

/**
 * Full-width, full-cover hero. The background is the festival banner set in
 * Admin -> Hero banner; without one it falls back to solid #2C3480.
 * A dark gradient overlay keeps the white text readable on any image.
 */
export default function Hero({ backgroundUrl }: { backgroundUrl?: string | null }) {
  return (
    <section
      className="relative isolate w-full overflow-hidden"
      style={{ backgroundColor: HERO_FALLBACK_COLOR }}
    >
      {backgroundUrl && (
        // Plain <img> (not next/image) so any https image URL the admin pastes works without next.config changes.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundUrl}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      {/* Contrast overlay: darker behind the text (left / bottom on mobile), lighter over the picture. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/45 to-black/25 md:bg-gradient-to-r md:from-black/70 md:via-black/45 md:to-black/15" />

      <div className="relative mx-auto grid min-h-[28rem] max-w-7xl gap-10 px-4 pb-14 pt-36 sm:px-6 md:min-h-[34rem] md:grid-cols-2 md:items-center md:pb-20 md:pt-40 lg:px-8">
        <div className="text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-purple-600 shadow-card ring-1 ring-brand-purple-100">
            <Sparkles size={14} className="text-brand-gold-500" />
            Nepal&apos;s cutest gifting spot
          </span>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl">
            Gifts that say <span className="text-brand-gold-200">it, cutely.</span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
            Premium dolls, fresh bouquets, curated gift boxes and combo hampers —
            handpicked in Kathmandu, delivered across Nepal via Nepal Can Move, or
            shipped with love to the Nepali diaspora abroad.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center gap-2 rounded-full brand-gradient-bg px-7 py-3.5 text-sm font-semibold text-white shadow-soft ring-2 ring-white/30 transition-transform hover:scale-105"
            >
              Explore the Shop
            </Link>
            <a
              href={buildGeneralWhatsAppLink("Hello DollNepal! I would like to know more about your gifts and dolls.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-purple-700 shadow-soft transition-colors hover:bg-brand-cream-100"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-white/85">
            <div>
              <p className="font-display text-2xl font-semibold text-white">500+</p>
              <p>Happy customers</p>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div>
              <p className="font-display text-2xl font-semibold text-white">4.9★</p>
              <p>Loved on Instagram</p>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div>
              <p className="font-display text-2xl font-semibold text-white">Nepal-wide</p>
              <p>&amp; diaspora shipping</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-md">
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
          <Link
            href="/trending"
            className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-brand-gold-200 sm:-left-8"
          >
            <p className="text-xs font-semibold text-brand-gold-600">🔥 Trending now</p>
            <p className="font-display text-sm font-semibold text-neutral-800">See what&apos;s hot →</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
