"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { del } from "@vercel/blob";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/actions/auth";
import { normalizeDiscountPercent } from "@/lib/pricing";
import type { ProductCategory, ProductColor } from "@/lib/types";

const CATEGORIES: ProductCategory[] = ["Doll", "Bouquet", "Gifts", "Combo"];

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  weight: number;
  imageUrl: string;
  imagePath: string | null;
  gallery: string[];
  colors: ProductColor[];
  description: string;
  trending: boolean;
  discountPercent: number;
  isOutOfStock: boolean;
  isHidden: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BLOB_HOST = "blob.vercel-storage.com";
const MAX_GALLERY = 10;
const MAX_COLORS = 12;
const MAX_COLOR_IMAGES = 10;

function isHttps(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates and cleans the extra photos + colour options. */
function normalizeVariants(input: ProductInput): { gallery: string[]; colors: ProductColor[] } {
  const gallery = (input.gallery ?? []).filter((u) => u && u !== input.imageUrl);
  if (gallery.length > MAX_GALLERY) throw new Error(`You can add up to ${MAX_GALLERY} extra photos.`);
  if (!gallery.every(isHttps)) throw new Error("Invalid photo URL.");

  const rawColors = input.colors ?? [];
  if (rawColors.length > MAX_COLORS) throw new Error(`You can add up to ${MAX_COLORS} colours.`);
  const seen = new Set<string>();
  const colors = rawColors.map((c) => {
    const name = String(c.name ?? "").trim();
    if (!name) throw new Error("Every colour needs a name.");
    if (name.length > 30) throw new Error(`Colour name "${name}" is too long (max 30 characters).`);
    if (seen.has(name.toLowerCase())) throw new Error(`Colour "${name}" is listed twice.`);
    seen.add(name.toLowerCase());
    const images = (c.images ?? []).filter(Boolean);
    if (images.length === 0) throw new Error(`Please add at least one photo for the colour "${name}".`);
    if (images.length > MAX_COLOR_IMAGES) throw new Error(`"${name}" can have up to ${MAX_COLOR_IMAGES} photos.`);
    if (!images.every(isHttps)) throw new Error("Invalid photo URL.");
    const hex = c.hex && /^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex.toLowerCase() : null;
    return { name, hex, images };
  });
  return { gallery, colors };
}

/** Every uploaded (Vercel Blob) file a product document points to. */
function collectBlobUrls(d: {
  imageUrl?: string | null;
  imagePath?: string | null;
  gallery?: unknown;
  colors?: unknown;
}): Set<string> {
  const urls = new Set<string>();
  const add = (u: unknown) => {
    if (typeof u === "string" && u.includes(BLOB_HOST)) urls.add(u);
  };
  add(d.imageUrl);
  add(d.imagePath);
  if (Array.isArray(d.gallery)) d.gallery.forEach(add);
  if (Array.isArray(d.colors)) {
    for (const c of d.colors as { images?: unknown }[]) {
      if (c && Array.isArray(c.images)) c.images.forEach(add);
    }
  }
  return urls;
}

async function deleteBlobs(urls: Iterable<string>) {
  await Promise.all([...urls].map((u) => del(u).catch(() => {})));
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
  const d = Number(input.discountPercent ?? 0);
  if (!Number.isFinite(d) || d < 0 || d > 100) {
    throw new Error("Discount must be a number between 0 and 100.");
  }
  if (!input.imageUrl?.trim()) throw new Error("A product image is required.");
  normalizeVariants(input);
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/trending");
  revalidatePath("/cart");
  revalidatePath("/admin/products");
  revalidatePath("/sitemap.xml");
}

export async function createProductAction(
  input: ProductInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
    validate(input);
    const variants = normalizeVariants(input);

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
        gallery: variants.gallery,
        colors: variants.colors,
        description: input.description?.trim() ?? "",
        trending: Boolean(input.trending),
        discountPercent: normalizeDiscountPercent(input.discountPercent),
        isOutOfStock: Boolean(input.isOutOfStock),
        isHidden: Boolean(input.isHidden),
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
    const variants = normalizeVariants(input);

    const ref = adminDb.collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Product not found.");

    const before = collectBlobUrls(existing.data() ?? {});

    await ref.update({
      name: input.name.trim(),
      category: input.category,
      price: input.price,
      weight: input.weight,
      imageUrl: input.imageUrl,
      imagePath: input.imagePath,
      gallery: variants.gallery,
      colors: variants.colors,
      description: input.description?.trim() ?? "",
      trending: Boolean(input.trending),
      discountPercent: normalizeDiscountPercent(input.discountPercent),
      isOutOfStock: Boolean(input.isOutOfStock),
      isHidden: Boolean(input.isHidden),
    });

    // Clean up uploaded files that are no longer used by this product.
    const after = collectBlobUrls({ imageUrl: input.imageUrl, imagePath: input.imagePath, gallery: variants.gallery, colors: variants.colors });
    await deleteBlobs([...before].filter((u) => !after.has(u)));

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

    const blobUrls = collectBlobUrls(existing.data() ?? {});
    await ref.delete();
    await deleteBlobs(blobUrls);

    revalidateStorefront();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete product." };
  }
}

/** Quick toggles from the admin product list. */
export async function toggleProductFlagAction(
  id: string,
  flag: "isOutOfStock" | "isHidden",
  value: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
    if (flag !== "isOutOfStock" && flag !== "isHidden") throw new Error("Invalid flag.");

    const ref = adminDb.collection("products").doc(id);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Product not found.");

    await ref.update({ [flag]: Boolean(value) });

    revalidateStorefront();
    revalidatePath(`/product/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update product." };
  }
}
