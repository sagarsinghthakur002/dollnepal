import type { Product, ProductVariant } from "./types";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && HEX.test(v);
}

export function variantId(name: string, taken: Set<string>): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "colour";
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  taken.add(id);
  return id;
}

/** Parse whatever is stored in Firestore into clean variants (tolerates missing/legacy data). */
export function normalizeVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  const taken = new Set<string>();
  return raw
    .filter((v) => v && typeof v === "object")
    .map((v) => {
      const o = v as Record<string, unknown>;
      const name = typeof o.name === "string" ? o.name.trim() : "";
      const id = typeof o.id === "string" && o.id && !taken.has(o.id) ? (taken.add(o.id), o.id) : variantId(name, taken);
      return {
        id,
        name,
        hex: isHexColor(o.hex) ? o.hex : "#cccccc",
        images: Array.isArray(o.images) ? o.images.filter((i): i is string => typeof i === "string" && !!i) : [],
        inStock: o.inStock !== false,
      };
    })
    .filter((v) => v.name);
}

/** Product is purchasable when at least one colour is in stock (or, with no colours, the flag is off). */
export function isProductOutOfStock(p: Pick<Product, "variants" | "isOutOfStock">): boolean {
  return p.variants.length > 0 ? p.variants.every((v) => !v.inStock) : p.isOutOfStock;
}

export function findVariant(p: Pick<Product, "variants">, id: string | undefined | null) {
  return id ? p.variants.find((v) => v.id === id) ?? null : null;
}

export const lineKey = (i: { productId: string; variantId?: string }) => `${i.productId}::${i.variantId ?? ""}`;
