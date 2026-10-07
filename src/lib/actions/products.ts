"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { del } from "@vercel/blob";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/actions/auth";
import type { ProductCategory } from "@/lib/types";

const CATEGORIES: ProductCategory[] = ["Doll", "Bouquet", "Gifts", "Combo"];

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  weight: number;
  imageUrl: string;
  imagePath: string | null;
  description: string;
  trending: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validate(input: ProductInput) {
  if (!input.name?.trim()) throw new Error("Product name is required.");
  if (!CATEGORIES.includes(input.category as ProductCategory)) {
    throw new Error(`Category must be one of ${CATEGORIES.join(", ")}.`);
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("Price must be a non-negative number.");
  }
  if (!Number.isFinite(input.weight) || input.weight <= 0 || input.weight > 1000) {
    throw new Error("Weight must be a number greater than 0 (in kg).");
  }
  if (!input.imageUrl?.trim()) throw new Error("A product image is required.");
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/trending");
  revalidatePath("/admin/products");
  revalidatePath("/sitemap.xml");
}

export async function createProductAction(
  input: ProductInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
    validate(input);

    const base = slugify(input.name) || `product-${Date.now()}`;
    let id = base;
    let suffix = 2;
    while ((await adminDb.collection("products").doc(id).get()).exists) {
      id = `${base}-${suffix++}`;
    }

    await adminDb
      .collection("products")
      .doc(id)
      .set({
        name: input.name.trim(),
        category: input.category,
        price: input.price,
        weight: input.weight,
        imageUrl: input.imageUrl,
        imagePath: input.imagePath,
        description: input.description?.trim() ?? "",
        trending: Boolean(input.trending),
        createdAt: FieldValue.serverTimestamp(),
      });

    revalidateStorefront();
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create product." };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
    validate(input);

    const ref = adminDb.collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Product not found.");

    const previousImagePath = existing.data()?.imagePath as string | null | undefined;

    await ref.update({
      name: input.name.trim(),
      category: input.category,
      price: input.price,
      weight: input.weight,
      imageUrl: input.imageUrl,
      imagePath: input.imagePath,
      description: input.description?.trim() ?? "",
      trending: Boolean(input.trending),
    });

    // If the image was replaced with a newly uploaded one, clean up the old file.
    if (previousImagePath && previousImagePath !== input.imagePath) {
      await del(previousImagePath).catch(() => {});
    }

    revalidateStorefront();
    revalidatePath(`/product/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update product." };
  }
}

export async function deleteProductAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();

    const ref = adminDb.collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Product not found.");

    const imagePath = existing.data()?.imagePath as string | null | undefined;
    await ref.delete();

    if (imagePath) {
      await del(imagePath).catch(() => {});
    }

    revalidateStorefront();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete product." };
  }
}
