import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@/lib/types";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

const COLLECTION = "orders";

function toOrder(doc: QueryDocumentSnapshot): Order {
  const data = doc.data();
  return {
    orderId: doc.id,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    total: data.total,
    paymentStatus: data.paymentStatus,
    paymentMethod: data.paymentMethod ?? null,
    shippingStatus: data.shippingStatus,
    ncmTrackingId: data.ncmTrackingId ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date(0).toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? new Date(0).toISOString(),
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const doc = await adminDb.collection(COLLECTION).doc(orderId).get();
  if (!doc.exists) return null;
  return toOrder(doc as QueryDocumentSnapshot);
}

export async function findOrdersByPhone(phone: string): Promise<Order[]> {
  const snap = await adminDb.collection(COLLECTION).where("customer.phone", "==", phone).get();
  return snap.docs
    .map(toOrder)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map(toOrder);
}
