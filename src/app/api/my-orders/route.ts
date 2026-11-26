import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getOrdersByUserId } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

/** Returns the signed-in customer's orders (identified by the signed session cookie). */
export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const orders = await getOrdersByUserId(user.sub);
    return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
