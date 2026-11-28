/**
 * Shop details shown across the site (announcement bar, help centre, product pages, footer).
 * EDIT THESE to match your real policies — they are the only place you need to change.
 */
export const SITE_INFO = {
  announcement: "Delivery across Nepal with Nepal Can Move & Upaya",
  hours: "Every day, 9 am – 8 pm",
  location: "Kathmandu, Nepal",
  deliveryTime: {
    insideValley: "1–2 days",
    outsideValley: "2–5 days",
  },
  // Shown in the Help centre and on product pages.
  returns: [
    "Please check the item details, colour and size before you order.",
    "If an item arrives damaged or isn't what you ordered, message us on WhatsApp within 24 hours of delivery with photos of the item and the parcel, and we'll work out a fix with you.",
  ],
  instagramUrl: "https://www.instagram.com/dollnepal.np",
  instagramHandle: "@dollnepal.np",
  tiktokUrl: "https://www.tiktok.com/@dollnepal.np",
} as const;
