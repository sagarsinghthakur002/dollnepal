import Link from "next/link";
import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import TrendingSection from "@/components/TrendingSection";
import { getAllProducts, getTrendingProducts } from "@/lib/data/products";
import { getHeroSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trending, products, hero] = await Promise.all([
    getTrendingProducts(4),
    getAllProducts(),
    getHeroSettings(),
  ]);

  return (
    <main>
      <Hero backgroundUrl={hero.imageUrl} />

      <CategoryShowcase products={products} />

      <TrendingSection products={trending} />

      <section className="bg-brand-cream-100">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-neutral-900">
            Add to cart, checkout, and <span className="brand-gradient-text">pay your way</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
            Pick your favourites, check out with your delivery details, and pay via eSewa,
            Khalti or bank transfer — or confirm your order directly on WhatsApp. We&apos;ll take it from there.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-full brand-gradient-bg px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
          >
            Browse the full shop
          </Link>
        </div>
      </section>
    </main>
  );
}
