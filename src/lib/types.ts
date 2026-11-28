import type { Courier } from "./couriers";

export type ProductCategory = "Doll" | "Bouquet" | "Gifts" | "Combo";

export interface ProductColor {
  name: string;
  hex: string | null; // optional swatch colour like "#ef2f87"
  images: string[]; // photos of this colour (first one is the cover)
}

export interface Product {
  id: string; // slug
  name: string;
  category: ProductCategory;
  price: number; // NPR
  weight: number; // kg
  imageUrl: string;
  imagePath: string | null; // Vercel Blob URL (same as imageUrl), null for seed/local images
  description: string;
  trending: boolean;
  gallery: string[]; // extra product photos (the main photo is `imageUrl`)
  colors: ProductColor[]; // optional colour options, each with its own photos
  discountPercent: number; // 0-100; `price` stays the base price, final price is derived (see lib/pricing.ts)
  isOutOfStock: boolean; // shown with an "Out of Stock" badge, cannot be added to cart
  isHidden: boolean; // hidden from the public storefront, still visible in admin
  createdAt: string; // ISO
}

export interface CartItem {
  productId: string;
  name: string;
  price: number; // unit price AFTER any discount
  originalPrice?: number; // base price, present when a discount was applied
  discountPercent?: number;
  color?: string; // chosen colour option (when the product has colours)
  weight?: number; // kg per unit (absent on carts saved before weights existed)
  image: string;
  qty: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // unit price charged (after discount)
  originalPrice?: number; // base price at order time, when discounted
  discountPercent?: number;
  color?: string; // chosen colour option, if any
  weight: number;
  image: string;
  qty: number;
  lineTotal: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  location: string;
}

export type PaymentStatus =
  | "unpaid"
  | "pending_verification"
  | "paid"
  | "refunded";

export type ShippingStatus =
  | "processing"
  | "dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "esewa" | "khalti" | "bank" | "fonpay" | null;

export interface Order {
  orderId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryRegion: "inside_valley" | "outside_valley";
  totalWeight: number; // kg
  deliveryCharge: number;
  total: number; // subtotal + deliveryCharge
  paymentProofUrl: string | null;
  paymentProofUploadedAt: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingStatus: ShippingStatus;
  courier: Courier | null; // assigned courier partner
  ncmTrackingId: string | null; // tracking ID for the assigned courier (field name kept for existing data)
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface TrackingStep {
  key: ShippingStatus;
  label: string;
  description: string;
  done: boolean;
  current: boolean;
}

export interface HeroSettings {
  imageUrl: string | null; // festival / banner background; null = solid fallback colour
  imagePath: string | null; // Vercel Blob URL when uploaded (for cleanup), null for external URLs
}
