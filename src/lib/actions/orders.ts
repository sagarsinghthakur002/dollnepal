"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/actions/auth";
import { generateOrderId } from "@/lib/orderId";
import { calculateShippingFee, isDeliveryRegion, totalWeightKg, type DeliveryRegion } from "@/lib/shipping";
import type { CartItem, OrderCustomer, PaymentStatus, ShippingStatus } from "@/lib/types";

export async function createOrderAction(
  cartItems: CartItem[],
  customer: OrderCustomer,
  deliveryRegion: DeliveryRegion
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  try {
    if (!cartItems.length) throw new Error("Your cart is empty.");
    if (!customer.name?.trim() || !customer.phone?.trim() || !customer.location?.trim()) {
      throw new Error("Name, phone and delivery location are required.");
    }

    if (!isDeliveryRegion(deliveryRegion)) throw new Error("Please select a delivery region.");

    // Re-derive item prices/names from Firestore rather than trusting the
    // client, so a tampered cart can't under-charge an order.
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const doc = await adminDb.collection("products").doc(item.productId).get();
        if (!doc.exists) throw new Error(`Product "${item.name}" is no longer available.`);
        const data = doc.data()!;
        const qty = Math.max(1, Math.floor(item.qty));
        return {
          productId: item.productId,
          name: data.name as string,
          price: data.price as number,
          weight: typeof data.weight === "number" ? data.weight : 0,
          image: data.imageUrl as string,
          qty,
          lineTotal: (data.price as number) * qty,
        };
      })
    );

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    // Shipping is always computed server-side from Firestore weights.
    const totalWeight = totalWeightKg(items);
    const deliveryCharge = calculateShippingFee(deliveryRegion, totalWeight);
    const orderId = generateOrderId();

    await adminDb
      .collection("orders")
      .doc(orderId)
      .set({
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          location: customer.location.trim(),
        },
        items,
        subtotal,
        deliveryRegion,
        totalWeight,
        deliveryCharge,
        total: subtotal + deliveryCharge,
        paymentProofUrl: null,
        paymentProofUploadedAt: null,
        paymentStatus: "unpaid" satisfies PaymentStatus,
        paymentMethod: null,
        shippingStatus: "processing" satisfies ShippingStatus,
        ncmTrackingId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    revalidatePath("/admin/orders");
    return { ok: true, orderId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to place order." };
  }
}

export async function markPaymentSubmittedAction(
  orderId: string,
  paymentMethod: "esewa" | "fonpay",
  paymentProofUrl: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const ref = adminDb.collection("orders").doc(orderId);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Order not found.");
    if (existing.data()?.paymentStatus === "paid") throw new Error("This order is already paid.");

    // The proof must be a blob uploaded for this order via /api/upload-proof.
    let proofOk = false;
    try {
      const u = new URL(paymentProofUrl);
      proofOk =
        u.protocol === "https:" &&
        u.hostname.endsWith(".public.blob.vercel-storage.com") &&
        decodeURIComponent(u.pathname).startsWith(`/payment-proofs/${orderId}/`);
    } catch {
      proofOk = false;
    }
    if (!proofOk) throw new Error("Please upload your payment screenshot before submitting.");

    await ref.update({
      paymentStatus: "pending_verification" satisfies PaymentStatus,
      paymentMethod,
      paymentProofUrl,
      paymentProofUploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update order." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  updates: Partial<{
    paymentStatus: PaymentStatus;
    shippingStatus: ShippingStatus;
    ncmTrackingId: string | null;
  }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();

    const ref = adminDb.collection("orders").doc(orderId);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Order not found.");

    await ref.update({ ...updates, updatedAt: FieldValue.serverTimestamp() });

    revalidatePath(`/order/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/track");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update order." };
  }
}
