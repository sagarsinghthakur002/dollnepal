"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, PackageCheck, Plus, ShoppingBag, Truck, Wallet } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import DeliveryEstimator from "@/components/product/DeliveryEstimator";
import { descriptionLines } from "@/lib/description";
import { formatRs } from "@/lib/currency";
import { getFinalPrice, hasDiscount } from "@/lib/pricing";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

export default function ProductView({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasColours = product.variants.length > 0;

  // Start on the first colour that is in stock (falls back to the first colour).
  const [variantId, setVariantId] = useState<string | null>(
    hasColours ? (product.variants.find((v) => v.inStock) ?? product.variants[0]).id : null
  );
  const [imageIdx, setImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const images = variant && variant.images.length ? variant.images : [product.imageUrl];
  const current = Math.min(imageIdx, images.length - 1);
  const inStock = variant ? variant.inStock : !product.isOutOfStock;

  const finalPrice = getFinalPrice(product.price, product.discountPercent);
  const discounted = hasDiscount(product.discountPercent);
  const savings = product.price - finalPrice;

  const desc = descriptionLines(product.description);
  const details = descriptionLines(product.details);

  function pickColour(id: string) {
    setVariantId(id);
    setImageIdx(0);
    setAdded(false);
  }

  function handleAdd() {
    if (!inStock) return;
    if (addItem(product, qty, variant?.id)) setAdded(true);
  }

  const whatsappHref = buildGeneralWhatsAppLink(
    [
      "Hello DollNepal! I'd like to order:",
      "",
      `Product: ${product.name}`,
      ...(variant ? [`Colour: ${variant.name}`] : []),
      `Quantity: ${qty}`,
      `Price: ${formatRs(finalPrice)} each (total ${formatRs(finalPrice * qty)})`,
      `Link: ${typeof window !== "undefined" ? window.location.href : ""}`,
    ].join("\n")
  );

  const meta = [product.category, product.sku && `Item #${product.sku}`, product.weight > 0 && `${product.weight} kg`].filter(Boolean).join(" · ");

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* ── Gallery ─────────────────────────────────────────── */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
        {images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto sm:max-h-[34rem] sm:flex-col sm:overflow-y-auto sm:overflow-x-visible" role="tablist" aria-label="Product photos">
            {images.map((src, i) => (
              <button
                key={`${variantId}-${i}`}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setImageIdx(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-20 sm:w-20 ${
                  i === current ? "ring-2 ring-burnt-500 ring-offset-2" : "opacity-80 ring-1 ring-neutral-200 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-neutral-100">
          <Image
            key={images[current]}
            src={images[current]}
            alt={variant ? `${product.name} in ${variant.name}` : product.name}
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            className={`object-cover ${inStock ? "" : "opacity-70"}`}
            priority
          />
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            {current + 1}/{images.length}
          </span>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Previous photo" onClick={() => setImageIdx((current - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white">
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Next photo" onClick={() => setImageIdx((current + 1) % images.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white">
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Info & actions ──────────────────────────────────── */}
      <div>
        <p className="text-xs text-neutral-500">{meta}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">{product.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-3xl font-bold text-burnt-600">{formatRs(finalPrice)}</span>
          {discounted && <span className="text-lg text-neutral-400 line-through">{formatRs(product.price)}</span>}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`} aria-live="polite">
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        {discounted && savings > 0 && <p className="mt-1 text-sm font-medium text-emerald-700">You save {formatRs(savings)}</p>}

        {desc.length > 1 ? (
          <ul className="mt-5 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-neutral-600 marker:text-burnt-500">
            {desc.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        ) : desc.length === 1 ? (
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">{desc[0]}</p>
        ) : null}

        {hasColours && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-800">
              Colour: <span className="font-normal text-neutral-600">{variant?.name}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-3" role="radiogroup" aria-label="Colour">
              {product.variants.map((v) => {
                const active = v.id === variantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`${v.name}${v.inStock ? "" : " (out of stock)"}`}
                    title={`${v.name}${v.inStock ? "" : " — out of stock"}`}
                    onClick={() => pickColour(v.id)}
                    className={`relative h-9 w-9 rounded-full ring-1 ring-black/15 transition-shadow ${active ? "ring-2 ring-burnt-500 ring-offset-2" : "hover:ring-neutral-400"}`}
                    style={{ backgroundColor: v.hex }}
                  >
                    {!v.inStock && (
                      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute left-1/2 top-1/2 h-0.5 w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-neutral-500/80" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className={`flex shrink-0 items-center rounded-full border border-neutral-300 ${inStock ? "" : "pointer-events-none opacity-50"}`}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="flex h-12 w-11 items-center justify-center text-neutral-600 hover:text-burnt-600">
              <Minus size={16} />
            </button>
            <span className="w-7 text-center text-sm font-semibold text-neutral-900" aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity" className="flex h-12 w-11 items-center justify-center text-neutral-600 hover:text-burnt-600">
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-burnt-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-burnt-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
          >
            {added && inStock ? <Check size={18} /> : <ShoppingBag size={18} />}
            {!inStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
          </button>
        </div>
        {added && inStock && (
          <p className="mt-2 text-sm text-neutral-500">
            <Link href="/cart" className="font-semibold text-burnt-600 hover:underline">View cart &amp; checkout →</Link>
          </p>
        )}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!inStock}
          onClick={(e) => !inStock && e.preventDefault()}
          className={`mt-3 flex h-12 w-full items-center justify-center rounded-full border-2 border-burnt-500 text-sm font-semibold text-burnt-600 transition-colors ${inStock ? "hover:bg-burnt-50" : "pointer-events-none opacity-50"}`}
        >
          Order on WhatsApp
        </a>

        <div className="mt-6">
          <DeliveryEstimator weightKg={Math.round(product.weight * qty * 1000) / 1000} />
        </div>

        <ul className="mt-5 space-y-3 text-sm text-neutral-600">
          <li className="flex gap-3"><Truck size={18} className="mt-0.5 shrink-0 text-burnt-500" /><span>Track your parcel live with Nepal Can Move until it reaches you.</span></li>
          <li className="flex gap-3"><Wallet size={18} className="mt-0.5 shrink-0 text-burnt-500" /><span>Pay your way. Full payment, or delivery fee now and the rest on delivery.</span></li>
          <li className="flex gap-3"><PackageCheck size={18} className="mt-0.5 shrink-0 text-burnt-500" /><span>Checked before dispatch. We inspect every item before it leaves.</span></li>
        </ul>

        {details.length > 0 && (
          <details className="group mt-6 border-t border-neutral-200 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
              Details
              <ChevronDown size={18} className="text-neutral-500 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-600 marker:text-burnt-500">
              {details.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
