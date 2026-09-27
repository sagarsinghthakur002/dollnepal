import ProductsManager from "@/components/admin/ProductsManager";
import { getAllProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  return <ProductsManager products={products} />;
}
