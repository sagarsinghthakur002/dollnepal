import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DollNepal – Cute Gifts, Dolls & Bouquets",
    short_name: "DollNepal",
    description: "Premium dolls, gift bouquets, combo hampers and cute gifts delivered across Nepal.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    prefer_related_applications: false,
    lang: "en",
    dir: "ltr",
    orientation: "portrait",
    background_color: "#fff8f3",
    theme_color: "#d31b70",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Shop", url: "/shop", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Track Order", url: "/track", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
