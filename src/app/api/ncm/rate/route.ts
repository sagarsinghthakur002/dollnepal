import { NextResponse } from "next/server";
import { getBranches, getDeliveryRates, NcmNotConfiguredError } from "@/lib/ncm-rates";

export async function GET(request: Request) {
  const destination = new URL(request.url).searchParams.get("destination")?.trim() ?? "";
  if (!destination) return NextResponse.json({ error: "destination is required." }, { status: 400 });

  try {
    // Only forward real NCM branch names — never arbitrary user input.
    const branches = await getBranches();
    const match = branches.find((b) => b.name.toLowerCase() === destination.toLowerCase());
    if (!match) return NextResponse.json({ error: "Unknown delivery area." }, { status: 404 });

    const { home, branch } = await getDeliveryRates(match.name);
    return NextResponse.json({ destination: match.name, home, branch }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (err) {
    const status = err instanceof NcmNotConfiguredError ? 503 : 502;
    return NextResponse.json({ error: "Couldn't fetch delivery prices right now." }, { status });
  }
}
