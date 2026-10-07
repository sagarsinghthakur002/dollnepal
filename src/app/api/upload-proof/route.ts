import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// Lets a customer upload a payment screenshot for THEIR order straight to
// Vercel Blob. Unlike /api/upload this is not admin-only, so it is locked down:
//  - the order must exist and not be paid yet
//  - the blob path must live under payment-proofs/<orderId>/
//  - only jpg/png, max 5 MB
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const orderId = String(clientPayload ?? "");
        if (!/^[A-Za-z0-9_-]{4,64}$/.test(orderId)) throw new Error("Invalid order.");
        if (!pathname.startsWith(`payment-proofs/${orderId}/`)) throw new Error("Invalid upload path.");

        const order = await adminDb.collection("orders").doc(orderId).get();
        if (!order.exists) throw new Error("Order not found.");
        if (order.data()?.paymentStatus === "paid") throw new Error("This order is already paid.");

        return {
          allowedContentTypes: ["image/jpeg", "image/png"],
          addRandomSuffix: true,
          maximumSizeInBytes: 5 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // No-op: the order is updated by markPaymentSubmittedAction.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
