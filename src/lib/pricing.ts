/**
 * Non-destructive discounts: `price` in the database is always the base price.
 * The price a customer actually pays is derived from it on the fly.
 */

export function normalizeDiscountPercent(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.round(n * 100) / 100);
}

/** Final unit price in whole NPR after applying `discountPercent` (0 = no discount). */
export function getFinalPrice(price: number, discountPercent: number | null | undefined): number {
  const pct = normalizeDiscountPercent(discountPercent);
  if (pct === 0) return price;
  return Math.max(0, Math.round((price * (100 - pct)) / 100));
}

export function hasDiscount(discountPercent: number | null | undefined): boolean {
  return normalizeDiscountPercent(discountPercent) > 0;
}

/** "-20%" / "-12.5%" */
export function formatDiscountBadge(discountPercent: number): string {
  return `-${normalizeDiscountPercent(discountPercent)}%`;
}
