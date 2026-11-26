import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getOrdersByUserId } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

/** Returns the signed-in customer's orders. Auth: `Authorization: Bearer <Firebase ID token>`. */
export async function GET(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const orders = await getOrdersByUserId(decoded.uid);
    return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }
}
