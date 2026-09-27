import { Flame } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

export default function Trending() {
  const { products, loading, error } = useProducts();
  const trending = products.filter((p) => p.trending);

  return (
    <>
      <Seo
        title="Trending"
        description="See what's hot right now at DollNepal — our most-loved dolls, bouquets, gifts and combos in Nepal."
        path="/trending"
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink-600">
            <Flame size={16} />
            Hot right now
          </span>
          <h1 className="mt-1 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
            Trending Picks
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Our most-loved, most-gifted items — updated by our team as things heat up.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-brand-cream-200" />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-2xl bg-red-50 px-6 py-8 text-center text-sm text-red-600">{error}</p>
        ) : (
          <ProductGrid products={trending} emptyMessage="Nothing trending right now — check back soon!" />
        )}
      </main>
    </>
  );
}
