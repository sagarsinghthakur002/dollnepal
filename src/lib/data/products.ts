import { adminDb } from "@/lib/firebase/admin";
import type { Product } from "@/lib/types";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION = "products";

function toProduct(doc: QueryDocumentSnapshot): Product {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    category: data.category,
    price: data.price,
    imageUrl: data.imageUrl,
    imagePath: data.imagePath ?? null,
    description: data.description ?? "",
    trending: Boolean(data.trending),
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date(0).toISOString(),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toProduct(doc as QueryDocumentSnapshot);
}

export async function getTrendingProducts(limit = 4): Promise<Product[]> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("trending", "==", true)
    .limit(limit)
    .get();
  return snap.docs.map(toProduct);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  // Sorted client-side (rather than .orderBy()) so this doesn't require a
  // composite Firestore index on (category, createdAt).
  const snap = await adminDb.collection(COLLECTION).where("category", "==", category).get();
  return snap.docs
    .map(toProduct)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const snap = await adminDb
    .collection(COLLECTION)
    .where("category", "==", product.category)
    .limit(limit + 1)
    .get();
  return snap.docs.map(toProduct).filter((p) => p.id !== product.id).slice(0, limit);
}
