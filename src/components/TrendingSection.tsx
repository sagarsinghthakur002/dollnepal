import Link from "next/link";
import { Flame } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/lib/types";

export default function TrendingSection({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="trending-heading" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink-600">
              <Flame size={16} />
              Hot right now
            </span>
            <h2 id="trending-heading" className="mt-1 font-display text-3xl font-semibold text-neutral-900">
              Trending Picks
            </h2>
          </div>
          <Link href="/trending" className="text-sm font-semibold text-brand-purple-600 hover:underline">
            View all trending →
          </Link>
        </div>

        <ProductGrid products={products} emptyMessage="No trending items yet — check back soon!" />
      </div>
    </section>
  );
}
