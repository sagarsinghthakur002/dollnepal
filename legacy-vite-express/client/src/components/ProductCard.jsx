import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatNPR } from '../utils/currency.js';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

const CATEGORY_STYLES = {
  Doll: 'bg-brand-pink-50 text-brand-pink-600',
  Bouquet: 'bg-rose-50 text-rose-600',
  Gifts: 'bg-brand-gold-100 text-brand-gold-700',
  Combo: 'bg-brand-purple-50 text-brand-purple-600',
};

export default function ProductCard({ product }) {
  const pageUrl = `${window.location.origin}/product/${product.id}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft">
      {product.trending && (
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-neutral-900/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          🔥 Trending
        </span>
      )}

      <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-brand-cream-200">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CATEGORY_STYLES[product.category] || 'bg-neutral-100 text-neutral-600'}`}>
          {product.category}
        </span>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-base font-semibold text-neutral-900 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm font-bold text-brand-purple-700">{formatNPR(product.price)}</p>

        <a
          href={buildWhatsAppLink(product.name, pageUrl)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          <MessageCircle size={16} />
          Inquire on WhatsApp
        </a>
      </div>
    </article>
  );
}
