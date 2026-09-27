import type { Metadata } from "next";
import { Flame } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import { getTrendingProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending",
  description: "See what's hot right now at DollNepal — our most-loved dolls, bouquets, gifts and combos in Nepal.",
};

export default async function TrendingPage() {
  const trending = await getTrendingProducts(50);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink-600">
          <Flame size={16} />
          Hot right now
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Trending Picks</h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-500">
          Our most-loved, most-gifted items — updated by our team as things heat up.
        </p>
      </header>

      <ProductGrid products={trending} emptyMessage="Nothing trending right now — check back soon!" />
    </main>
  );
}
