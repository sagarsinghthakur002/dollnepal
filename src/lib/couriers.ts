export type Courier = "ncm" | "upaya";

export const COURIERS: {
  value: Courier;
  name: string;
  trackUrl: string;
  trackLabel: string;
  logo: string;
}[] = [
  {
    value: "ncm",
    name: "Nepal Can Move (NCM)",
    trackUrl: "https://portal.nepalcanmove.com/track/",
    trackLabel: "Track on Nepal Can Move",
    logo: "/couriers/ncm.svg",
  },
  {
    value: "upaya",
    name: "Upaya Services",
    trackUrl: "https://upaya.com.np/track",
    trackLabel: "Track on Upaya",
    logo: "/couriers/upaya.svg",
  },
];

export function isCourier(value: unknown): value is Courier {
  return value === "ncm" || value === "upaya";
}

export function getCourier(value: Courier | null | undefined) {
  return COURIERS.find((c) => c.value === value) ?? null;
}
