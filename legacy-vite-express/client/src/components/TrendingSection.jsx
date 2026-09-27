import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import ProductGrid from './ProductGrid.jsx';

export default function TrendingSection({ products, loading }) {
  const trending = products.filter((p) => p.trending).slice(0, 4);

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
          <Link to="/trending" className="text-sm font-semibold text-brand-purple-600 hover:underline">
            View all trending →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-brand-cream-200" />
            ))}
          </div>
        ) : (
          <ProductGrid products={trending} emptyMessage="No trending items yet — check back soon!" />
        )}
      </div>
    </section>
  );
}
