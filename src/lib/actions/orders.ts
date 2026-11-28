"use server";

import { isCourier, type Courier } from "@/lib/couriers";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/actions/auth";
import { getOrderById } from "@/lib/data/orders";
import { sendAdminNewOrderEmail } from "@/lib/email";
import { getFinalPrice, normalizeDiscountPercent } from "@/lib/pricing";
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
        if (data.isHidden) throw new Error(`Product "${item.name}" is no longer available.`);
        if (data.isOutOfStock) throw new Error(`"${data.name as string}" is currently out of stock. Please remove it from your cart.`);
        // Products with colour options need a valid colour; the photo shown on the order is that colour's photo.
        const colors = Array.isArray(data.colors) ? (data.colors as { name: string; images?: string[] }[]) : [];
        let color: string | undefined;
        let image = data.imageUrl as string;
        if (colors.length > 0) {
          const picked = colors.find((c) => c.name === item.color);
          if (!picked) throw new Error(`Please choose a colour for "${data.name as string}".`);
          color = picked.name;
          image = picked.images?.[0] ?? image;
        }
        const qty = Math.max(1, Math.floor(item.qty));
        const basePrice = data.price as number;
        const discountPercent = normalizeDiscountPercent(data.discountPercent);
        // The stored `price` is never modified; the charged price is derived from it.
        const unitPrice = getFinalPrice(basePrice, discountPercent);
        return {
          productId: item.productId,
          name: data.name as string,
          price: unitPrice,
          ...(discountPercent > 0 ? { originalPrice: basePrice, discountPercent } : {}),
          weight: typeof data.weight === "number" ? data.weight : 0,
          ...(color ? { color } : {}),
          image,
          qty,
          lineTotal: unitPrice * qty,
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
        courier: null,
        ncmTrackingId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    revalidatePath("/admin/orders");

    // Instant email to the admin as soon as an order is placed.
    const created = await getOrderById(orderId);
    if (created) await sendAdminNewOrderEmail(created, "placed");

    return { ok: true, orderId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to place order." };
  }
}

export async function markPaymentSubmittedAction(
  orderId: string,
  paymentMethod: "esewa" | "khalti" | "bank",
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
    revalidatePath(`/order/${orderId}/thank-you`);
    revalidatePath("/admin/orders");

    // Instant "New Order Received!" email to the admin (once, on the first payment submission).
    if (existing.data()?.paymentStatus === "unpaid") {
      const updated = await getOrderById(orderId);
      if (updated) await sendAdminNewOrderEmail(updated, "paid");
    }

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
    courier: Courier | null;
  }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();

    const ref = adminDb.collection("orders").doc(orderId);
    const existing = await ref.get();
    if (!existing.exists) throw new Error("Order not found.");

    if (updates.courier != null && !isCourier(updates.courier)) throw new Error("Invalid courier.");

    await ref.update({ ...updates, updatedAt: FieldValue.serverTimestamp() });

    revalidatePath(`/order/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/track");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update order." };
  }
}
