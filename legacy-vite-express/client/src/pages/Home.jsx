import { Link } from 'react-router-dom';
import { Gift, Flower2, PartyPopper, Package } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Hero from '../components/Hero.jsx';
import TrendingSection from '../components/TrendingSection.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

const CATEGORY_TILES = [
  { label: 'Dolls', value: 'Doll', icon: PartyPopper, blurb: 'Collectible & plush dolls' },
  { label: 'Bouquets', value: 'Bouquet', icon: Flower2, blurb: 'Fresh, hand-tied blooms' },
  { label: 'Gifts', value: 'Gifts', icon: Gift, blurb: 'Curated gift boxes' },
  { label: 'Combos', value: 'Combo', icon: Package, blurb: 'Doll + bouquet bundles' },
];

export default function Home() {
  const { products, loading } = useProducts();

  return (
    <>
      <Seo
        title={null}
        description="DollNepal brings joy with premium dolls, gift bouquets, combo hampers and cute gifts delivered across Nepal and shipped to the Nepali diaspora abroad. Order instantly on WhatsApp."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'DollNepal',
          url: 'https://dollnepal.com.np',
          logo: 'https://dollnepal.com.np/logo.jpg',
          description: 'Premium dolls, gift bouquets, combo hampers and cute gifts in Nepal.',
          sameAs: [],
        }}
      />

      <main>
        <Hero />

        <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 id="categories-heading" className="text-center font-display text-3xl font-semibold text-neutral-900">
            Shop by <span className="brand-gradient-text">category</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-500">
            Everything you need to make someone smile today.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORY_TILES.map(({ label, value, icon: Icon, blurb }) => (
              <Link
                key={value}
                to={`/shop?category=${value}`}
                className="group flex flex-col items-center gap-3 rounded-3xl bg-white px-4 py-8 text-center shadow-card ring-1 ring-black/5 transition-transform hover:-translate-y-1"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient-bg text-white transition-transform group-hover:scale-110">
                  <Icon size={26} />
                </span>
                <span className="font-display text-base font-semibold text-neutral-900">{label}</span>
                <span className="text-xs text-neutral-500">{blurb}</span>
              </Link>
            ))}
          </div>
        </section>

        <TrendingSection products={products} loading={loading} />

        <section className="bg-brand-cream-100">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-semibold text-neutral-900">
              No cart, no hassle — just <span className="brand-gradient-text">chat &amp; order</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
              Pick anything you love and message us directly on WhatsApp. We&apos;ll confirm
              availability, delivery and payment in minutes — friendly, fast, personal.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full brand-gradient-bg px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
            >
              Browse the full shop
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
