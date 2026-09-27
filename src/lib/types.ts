export type ProductCategory = "Doll" | "Bouquet" | "Gifts" | "Combo";

export interface Product {
  id: string; // slug
  name: string;
  category: ProductCategory;
  price: number; // NPR
  imageUrl: string;
  imagePath: string | null; // Vercel Blob URL (same as imageUrl), null for seed/local images
  description: string;
  trending: boolean;
  createdAt: string; // ISO
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
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

export type PaymentMethod = "esewa" | "fonpay" | null;

export interface Order {
  orderId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingStatus: ShippingStatus;
  ncmTrackingId: string | null;
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
