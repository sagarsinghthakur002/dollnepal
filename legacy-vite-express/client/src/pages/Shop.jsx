import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

export default function Shop() {
  const { products, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';

  const filtered = useMemo(() => {
    if (category === 'All') return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  function handleCategoryChange(next) {
    if (next === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', next);
    }
    setSearchParams(searchParams);
  }

  return (
    <>
      <Seo
        title="Shop"
        description="Browse DollNepal's full catalogue of dolls, bouquets, gifts and combo hampers. Filter by category and order instantly on WhatsApp."
        path="/shop"
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
            The <span className="brand-gradient-text">Shop</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            Every item is a message on WhatsApp away. Browse, pick, chat, done.
          </p>
        </header>

        <div className="mb-8">
          <CategoryFilter value={category} onChange={handleCategoryChange} />
        </div>

        <article aria-live="polite">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-brand-cream-200" />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-2xl bg-red-50 px-6 py-8 text-center text-sm text-red-600">{error}</p>
          ) : (
            <ProductGrid products={filtered} emptyMessage="No products in this category yet." />
          )}
        </article>
      </main>
    </>
  );
}
