export type DeliveryRegion = "inside_valley" | "outside_valley";

export const DELIVERY_REGIONS: { value: DeliveryRegion; label: string; baseRate: number }[] = [
  { value: "inside_valley", label: "Inside Valley", baseRate: 120 },
  { value: "outside_valley", label: "Outside Valley", baseRate: 200 },
];

export const BASE_WEIGHT_KG = 2;

export function isDeliveryRegion(value: unknown): value is DeliveryRegion {
  return value === "inside_valley" || value === "outside_valley";
}

export function regionLabel(region: DeliveryRegion): string {
  return DELIVERY_REGIONS.find((r) => r.value === region)?.label ?? region;
}

/** Total weight = sum(item weight x quantity), rounded to avoid float drift (0.1 * 3). */
export function totalWeightKg(items: { weight?: number | null; qty: number }[]): number {
  const sum = items.reduce((acc, i) => acc + (Number(i.weight) || 0) * i.qty, 0);
  return Math.round(sum * 1000) / 1000;
}

/**
 * Shipping Fee = Base + ceil(Total Weight - 2) x Base   (surcharge only when weight > 2 kg)
 * e.g. 4 kg, Outside Valley = 200 + 2 x 200 = 600.
 */
export function calculateShippingFee(region: DeliveryRegion, weightKg: number): number {
  const base = DELIVERY_REGIONS.find((r) => r.value === region)!.baseRate;
  const extraKg = Math.max(0, Math.ceil(Math.round((weightKg - BASE_WEIGHT_KG) * 1000) / 1000));
  return base + extraKg * base;
}
