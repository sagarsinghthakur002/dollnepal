import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gift, Flower2, PartyPopper, Package } from "lucide-react";
import type { Product } from "@/lib/types";

const TILES = [
  { label: "Dolls", value: "Doll", icon: PartyPopper, blurb: "Collectible & plush dolls" },
  { label: "Bouquets", value: "Bouquet", icon: Flower2, blurb: "Fresh, hand-tied blooms" },
  { label: "Gifts", value: "Gifts", icon: Gift, blurb: "Curated gift boxes" },
  { label: "Combos", value: "Combo", icon: Package, blurb: "Doll + bouquet bundles" },
] as const;

/** Clean photo-led category tiles. Each tile uses a real product photo from that category. */
export default function CategoryShowcase({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="categories-heading" className="font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Shop by category
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Everything you need to make someone smile.</p>
        </div>
        <Link
          href="/shop"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-neutral-700 hover:text-brand-pink-600 sm:inline-flex"
        >
          View all <ArrowUpRight size={16} />
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-4">
        {TILES.map(({ label, value, icon: Icon, blurb }) => {
          const inCategory = products.filter((p) => p.category === value);
          const cover = inCategory.find((p) => !p.isOutOfStock) ?? inCategory[0];
          return (
            <li key={value}>
              <Link
                href={`/shop?category=${value}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5 transition-shadow hover:shadow-soft"
              >
                {cover ? (
                  <Image
                    src={cover.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center brand-gradient-bg text-white/30">
                    <Icon size={72} strokeWidth={1.25} />
                  </span>
                )}

                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold leading-tight text-white sm:text-xl">{label}</span>
                    <span className="mt-0.5 block truncate text-xs text-white/80 sm:text-sm">
                      {inCategory.length > 0 ? `${inCategory.length} ${inCategory.length === 1 ? "item" : "items"}` : blurb}
                    </span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight size={18} />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link href="/shop" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 sm:hidden">
        View all products <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
