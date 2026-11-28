import { adminDb } from "@/lib/firebase/admin";
import { normalizeDiscountPercent } from "@/lib/pricing";
import type { Product, ProductColor } from "@/lib/types";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION = "products";

function parseColors(raw: unknown): ProductColor[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c): ProductColor | null => {
      if (!c || typeof c.name !== "string" || !c.name.trim()) return null;
      const images = Array.isArray(c.images) ? c.images.filter((u: unknown): u is string => typeof u === "string") : [];
      return { name: c.name, hex: typeof c.hex === "string" && c.hex ? c.hex : null, images };
    })
    .filter((c): c is ProductColor => c !== null);
}

function toProduct(doc: QueryDocumentSnapshot): Product {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    category: data.category,
    price: data.price,
    weight: typeof data.weight === "number" ? data.weight : 0,
    imageUrl: data.imageUrl,
    imagePath: data.imagePath ?? null,
    description: data.description ?? "",
    trending: Boolean(data.trending),
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((u: unknown): u is string => typeof u === "string") : [],
    colors: parseColors(data.colors),
    discountPercent: normalizeDiscountPercent(data.discountPercent),
    isOutOfStock: Boolean(data.isOutOfStock),
    isHidden: Boolean(data.isHidden),
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date(0).toISOString(),
  };
}

// Hidden filtering happens in memory (not via a Firestore `where`) because
// existing product documents don't have an `isHidden` field yet.
const isVisible = (p: Product) => !p.isHidden;

/** ADMIN ONLY: every product, including hidden ones. */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map(toProduct);
}

/** Public storefront: hidden products are excluded. */
export async function getAllProducts(): Promise<Product[]> {
  return (await getAllProductsAdmin()).filter(isVisible);
}

/** Hidden products return null (-> 404) unless `includeHidden` is set. */
export async function getProductById(id: string, includeHidden = false): Promise<Product | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const product = toProduct(doc as QueryDocumentSnapshot);
  if (!includeHidden && product.isHidden) return null;
  return product;
}

export async function getTrendingProducts(limit = 4): Promise<Product[]> {
  const snap = await adminDb.collection(COLLECTION).where("trending", "==", true).get();
  return snap.docs.map(toProduct).filter(isVisible).slice(0, limit);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  // Sorted client-side (rather than .orderBy()) so this doesn't require a
  // composite Firestore index on (category, createdAt).
  const snap = await adminDb.collection(COLLECTION).where("category", "==", category).get();
  return snap.docs
    .map(toProduct)
    .filter(isVisible)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const snap = await adminDb.collection(COLLECTION).where("category", "==", product.category).get();
  return snap.docs
    .map(toProduct)
    .filter((p) => p.id !== product.id && isVisible(p))
    .slice(0, limit);
}
