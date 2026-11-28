import { descriptionLines, descriptionPlain } from "@/lib/description";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import ProductDetailClient from "@/components/ProductDetailClient";
import PriceDisplay from "@/components/PriceDisplay";
import { SITE_INFO } from "@/lib/siteInfo";
import { getFinalPrice } from "@/lib/pricing";
import { getProductById, getRelatedProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: descriptionPlain(product.description) || `${product.name} — ${product.category} available at DollNepal, Nepal.`,
    openGraph: { images: [product.imageUrl] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: descriptionPlain(product.description),
    image: [product.imageUrl, ...product.gallery],
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: getFinalPrice(product.price, product.discountPercent),
      availability: product.isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="hover:text-brand-pink-600">Home</Link>
          <ChevronRight size={13} />
          <Link href={`/shop?category=${product.category}`} className="hover:text-brand-pink-600">{product.category}</Link>
          <ChevronRight size={13} />
          <span className="text-neutral-700">{product.name}</span>
        </nav>

        <ProductDetailClient
          product={product}
          siteUrl={SITE_URL}
          header={
            <>
              <span className="inline-block rounded-full bg-brand-purple-50 px-3 py-1 text-xs font-semibold text-brand-purple-600">
                {product.category}
              </span>
              {product.trending && (
                <span className="ml-2 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                  🔥 Trending
                </span>
              )}

              <h1 className="mt-3 font-display text-3xl font-semibold text-neutral-900">{product.name}</h1>
              <PriceDisplay price={product.price} discountPercent={product.discountPercent} size="lg" className="mt-3" />
              {product.isOutOfStock && (
                <p className="mt-2 text-sm font-semibold text-red-600">This item is currently out of stock.</p>
              )}

              {product.description &&
                (descriptionLines(product.description).length > 1 ? (
                  <ul className="mt-5 max-w-md list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-neutral-600 marker:text-brand-pink-500">
                    {descriptionLines(product.description).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600">{descriptionLines(product.description)[0]}</p>
                ))}
            </>
          }
          footer={
            <div className="mt-6 flex gap-3 rounded-2xl bg-brand-cream-100 p-4 text-sm leading-relaxed text-neutral-600 ring-1 ring-black/5">
              <Truck size={20} className="mt-0.5 shrink-0 text-brand-pink-500" />
              <p>
                Delivered across Nepal with Nepal Can Move or Upaya: usually {SITE_INFO.deliveryTime.insideValley} inside Kathmandu Valley and{" "}
                {SITE_INFO.deliveryTime.outsideValley} elsewhere. The delivery fee shows before you pay.{" "}
                <Link href="/help#delivery" className="font-semibold text-brand-purple-600 hover:underline">
                  Delivery &amp; returns
                </Link>
              </p>
            </div>
          }
        />

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
