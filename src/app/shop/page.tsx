import type { Metadata } from "next";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGrid from "@/components/ProductGrid";
import { getAllProducts, getProductsByCategory } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse DollNepal's full catalogue of dolls, bouquets, gifts and combo hampers. Filter by category, add to cart, and check out with eSewa, Khalti or bank transfer.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; stock?: string }>;
}) {
  const { category, stock } = await searchParams;
  const inStockOnly = stock === "1";
  const active = category && ["Doll", "Bouquet", "Gifts", "Combo"].includes(category) ? category : "All";

  const all = active === "All" ? await getAllProducts() : await getProductsByCategory(active);
  const products = inStockOnly ? all.filter((p) => !p.isOutOfStock) : all;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
          The <span className="brand-gradient-text">Shop</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-500">
          Prices in Nepali rupees. Stock updates as orders come in.
        </p>
      </header>

      <div className="mb-8">
        <CategoryFilter active={active} inStockOnly={inStockOnly} />
      </div>

      <ProductGrid products={products} emptyMessage={inStockOnly ? "Nothing in stock in this category right now." : "No products in this category yet."} />
    </main>
  );
}
