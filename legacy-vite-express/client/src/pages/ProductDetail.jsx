import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, ChevronRight } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { formatNPR } from '../utils/currency.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProducts();

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const related = useMemo(
    () => products.filter((p) => product && p.category === product.category && p.id !== id).slice(0, 4),
    [products, product, id]
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-brand-cream-200" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded-full bg-brand-cream-200" />
            <div className="h-9 w-2/3 animate-pulse rounded-full bg-brand-cream-200" />
            <div className="h-24 animate-pulse rounded-2xl bg-brand-cream-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">Product not found</h1>
        <p className="mt-2 text-sm text-neutral-500">This item may have been removed or renamed.</p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white">
          Back to shop
        </Link>
      </main>
    );
  }

  const pageUrl = `${window.location.origin}/product/${product.id}`;

  return (
    <>
      <Seo
        title={product.name}
        description={product.description || `${product.name} — ${product.category} available at DollNepal, Nepal.`}
        path={`/product/${product.id}`}
        image={product.image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image,
          category: product.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NPR',
            price: product.price,
            availability: 'https://schema.org/InStock',
            url: pageUrl,
          },
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link to="/" className="hover:text-brand-pink-600">Home</Link>
          <ChevronRight size={13} />
          <Link to={`/shop?category=${product.category}`} className="hover:text-brand-pink-600">{product.category}</Link>
          <ChevronRight size={13} />
          <span className="text-neutral-700">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <article>
            <div className="overflow-hidden rounded-3xl bg-brand-cream-200 shadow-card">
              <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
            </div>
          </article>

          <aside>
            <span className="inline-block rounded-full bg-brand-purple-50 px-3 py-1 text-xs font-semibold text-brand-purple-600">
              {product.category}
            </span>
            {product.trending && (
              <span className="ml-2 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                🔥 Trending
              </span>
            )}

            <h1 className="mt-3 font-display text-3xl font-semibold text-neutral-900">{product.name}</h1>
            <p className="mt-3 text-2xl font-bold text-brand-pink-600">{formatNPR(product.price)}</p>

            {product.description && (
              <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600">{product.description}</p>
            )}

            <a
              href={buildWhatsAppLink(product.name, pageUrl)}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full brand-gradient-bg px-8 py-4 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
            >
              <MessageCircle size={19} />
              Inquire / Buy on WhatsApp
            </a>

            <p className="mt-3 text-xs text-neutral-400">
              You&apos;ll be redirected to WhatsApp with your inquiry pre-filled — no account or cart needed.
            </p>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-16">
            <h2 id="related-heading" className="mb-6 font-display text-2xl font-semibold text-neutral-900">
              You might also like
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </main>
    </>
  );
}
