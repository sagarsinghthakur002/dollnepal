import { NextResponse } from "next/server";
import { verifyGoogleIdToken } from "@/lib/googleAuth";
import { CUSTOMER_SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Exchanges a Google Sign-In credential for DollNepal's own signed session cookie. */
export async function POST(request: Request) {
  try {
    const { credential } = (await request.json()) as { credential?: string };
    if (!credential) return NextResponse.json({ error: "Missing credential." }, { status: 400 });

    const user = await verifyGoogleIdToken(credential);
    const response = NextResponse.json({ user });
    response.cookies.set(CUSTOMER_SESSION_COOKIE, createSessionToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign-in failed.";
    const notConfigured = message.includes("isn't set up") || message.includes("AUTH_SECRET");
    return NextResponse.json(
      { error: notConfigured ? "Google sign-in isn't set up yet." : "Sign-in failed. Please try again." },
      { status: notConfigured ? 503 : 401 }
    );
  }
}
