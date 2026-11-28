import { NextResponse } from "next/server";
import { getBranches, NcmNotConfiguredError } from "@/lib/ncm-rates";

export async function GET() {
  try {
    const branches = await getBranches();
    return NextResponse.json({ branches }, { headers: { "Cache-Control": "public, max-age=600" } });
  } catch (err) {
    const status = err instanceof NcmNotConfiguredError ? 503 : 502;
    return NextResponse.json({ error: "Delivery areas are unavailable right now." }, { status });
  }
}
