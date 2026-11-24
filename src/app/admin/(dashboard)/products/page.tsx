import ProductsManager from "@/components/admin/ProductsManager";
import { getAllProductsAdmin } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();
  return <ProductsManager products={products} />;
}
