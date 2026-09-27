import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import ProductDetailActions from "@/components/ProductDetailActions";
import { formatNPR } from "@/lib/currency";
import { getProductById, getRelatedProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description || `${product.name} — ${product.category} available at DollNepal, Nepal.`,
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
    description: product.description,
    image: product.imageUrl,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability: "https://schema.org/InStock",
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

        <div className="grid gap-10 md:grid-cols-2">
          <article className="relative aspect-square overflow-hidden rounded-3xl bg-brand-cream-200 shadow-card">
            <Image src={product.imageUrl} alt={product.name} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" priority />
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

            <ProductDetailActions product={product} />
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
