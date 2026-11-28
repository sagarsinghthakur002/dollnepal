"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import ProductDetailActions from "@/components/ProductDetailActions";
import { formatNPR } from "@/lib/currency";
import { getFinalPrice } from "@/lib/pricing";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

/**
 * Product photo gallery + colour picker + add-to-cart. Choosing a colour swaps the gallery to that
 * colour's photos; the chosen colour (and its photo) goes into the cart and the order.
 * `header` / `footer` are server-rendered blocks (title, price, description / delivery note).
 */
export default function ProductDetailClient({
  product,
  siteUrl,
  header,
  footer,
}: {
  product: Product;
  siteUrl: string;
  header: ReactNode;
  footer: ReactNode;
}) {
  const [colorName, setColorName] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const color = product.colors.find((c) => c.name === colorName) ?? null;

  const images = color
    ? color.images
    : Array.from(
        new Set([product.imageUrl, ...product.gallery, ...product.colors.map((c) => c.images[0]).filter(Boolean)])
      );
  const active = images[Math.min(index, images.length - 1)] ?? product.imageUrl;

  function pickColor(name: string) {
    setColorName(name);
    setIndex(0);
  }

  const price = formatNPR(getFinalPrice(product.price, product.discountPercent));
  const whatsappMessage = `Hello DollNepal! I'd like to order: ${product.name}${color ? ` — ${color.name}` : ""} (${price}).\n${siteUrl}/product/${product.id}`;

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-brand-cream-200 shadow-card">
          {product.isOutOfStock && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow">
              Out of Stock
            </span>
          )}
          <Image
            key={active}
            src={active}
            alt={color ? `${product.name} in ${color.name}` : product.name}
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            className={`object-cover ${product.isOutOfStock ? "opacity-70" : ""}`}
            priority
          />
        </div>

        {images.length > 1 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
            {images.map((src, i) => (
              <li key={src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={src === active}
                  className={`relative block h-16 w-16 overflow-hidden rounded-xl bg-brand-cream-200 ring-2 transition-shadow sm:h-[4.5rem] sm:w-[4.5rem] ${
                    src === active ? "ring-brand-pink-500" : "ring-transparent hover:ring-neutral-300"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="72px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside>
        {header}

        {product.colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-800">
              Colour: <span className="font-normal text-neutral-500">{color ? color.name : "choose one"}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
              {product.colors.map((c) => {
                const selected = c.name === colorName;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => pickColor(c.name)}
                    className={`flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-semibold transition-colors ${
                      selected
                        ? "bg-brand-pink-50 text-brand-pink-600 ring-2 ring-brand-pink-500"
                        : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-brand-pink-300"
                    }`}
                  >
                    <span
                      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-black/10"
                      style={c.hex && !c.images[0] ? { backgroundColor: c.hex } : undefined}
                    >
                      {c.images[0] && <Image src={c.images[0]} alt="" fill sizes="36px" className="object-cover" />}
                    </span>
                    {c.hex && <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c.hex }} aria-hidden />}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <ProductDetailActions product={product} color={color?.name ?? null} colorImage={color?.images[0] ?? null} />

        <a
          href={buildGeneralWhatsAppLink(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <MessageCircle size={18} />
          Order on WhatsApp
        </a>

        {footer}
      </aside>
    </div>
  );
}
