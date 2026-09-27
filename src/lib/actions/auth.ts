"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

const SESSION_EXPIRES_IN_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function signInAdminAction(
  idToken: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || decoded.email !== adminEmail) {
      return { ok: false, error: "This account is not authorized for admin access." };
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    (await cookies()).set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Sign-in failed. Please try again." };
  }
}

export async function signOutAdminAction(): Promise<void> {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}

/** Verifies the current request's admin session. Call at the top of every admin Server Action. */
export async function requireAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) throw new Error("Unauthorized: no admin session.");

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || decoded.email !== adminEmail) {
    throw new Error("Unauthorized: not the admin account.");
  }
  return decoded;
}
