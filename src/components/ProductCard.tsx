import Link from "next/link";
import Image from "next/image";
import PriceDisplay from "@/components/PriceDisplay";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const swatches = product.colors.slice(0, 4);
  const moreColors = product.colors.length - swatches.length;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-soft">
      {product.isOutOfStock && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          Out of Stock
        </span>
      )}
      {product.trending && (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-neutral-900/85 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          🔥 Trending
        </span>
      )}

      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-brand-cream-200">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 18vw, (min-width: 768px) 24vw, (min-width: 640px) 32vw, 48vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${product.isOutOfStock ? "opacity-60 grayscale-[30%]" : ""}`}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-tight text-neutral-900 sm:text-sm">{product.name}</h3>
        </Link>

        <PriceDisplay price={product.price} discountPercent={product.discountPercent} />

        {swatches.length > 0 && (
          <div className="flex items-center gap-1" aria-label={`${product.colors.length} colours available`}>
            {swatches.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="relative h-4 w-4 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-black/10"
                style={c.hex ? { backgroundColor: c.hex } : undefined}
              >
                {!c.hex && c.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny swatch from an arbitrary storage URL
                  <img src={c.images[0]} alt="" className="h-full w-full object-cover" />
                )}
              </span>
            ))}
            {moreColors > 0 && <span className="text-[10px] font-semibold text-neutral-500">+{moreColors}</span>}
          </div>
        )}

        <div className="mt-1.5">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
