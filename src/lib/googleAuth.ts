import { createPublicKey, verify, type JsonWebKey } from "node:crypto";
import type { SessionUser } from "@/lib/types";

/**
 * Verifies a Google Sign-In ID token (JWT) locally using Google's public keys — no extra packages,
 * no Firebase. Free. Checks signature, issuer, audience (our OAuth client id) and expiry.
 */

const CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
let cachedKeys: { keys: (JsonWebKey & { kid: string })[]; expires: number } | null = null;

async function getGoogleKeys() {
  if (cachedKeys && cachedKeys.expires > Date.now()) return cachedKeys.keys;
  const res = await fetch(CERTS_URL, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("Could not load Google's sign-in keys.");
  const data = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
  cachedKeys = { keys: data.keys, expires: Date.now() + 60 * 60 * 1000 };
  return data.keys;
}

function b64urlToBuffer(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export async function verifyGoogleIdToken(credential: string): Promise<SessionUser> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in isn't set up yet.");

  const parts = credential.split(".");
  if (parts.length !== 3) throw new Error("Invalid sign-in token.");
  const [headerB64, payloadB64, signatureB64] = parts;

  const header = JSON.parse(b64urlToBuffer(headerB64).toString("utf8")) as { alg: string; kid: string };
  if (header.alg !== "RS256") throw new Error("Invalid sign-in token.");

  let keys = await getGoogleKeys();
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    cachedKeys = null; // keys may have rotated
    keys = await getGoogleKeys();
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) throw new Error("Invalid sign-in token.");

  const ok = verify(
    "RSA-SHA256",
    Buffer.from(`${headerB64}.${payloadB64}`),
    createPublicKey({ key: jwk, format: "jwk" }),
    b64urlToBuffer(signatureB64)
  );
  if (!ok) throw new Error("Invalid sign-in token.");

  const payload = JSON.parse(b64urlToBuffer(payloadB64).toString("utf8")) as {
    iss: string;
    aud: string;
    exp: number;
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
    throw new Error("Invalid sign-in token.");
  }
  if (payload.aud !== clientId) throw new Error("Invalid sign-in token.");
  if (!payload.exp || payload.exp * 1000 < Date.now()) throw new Error("Sign-in expired. Please try again.");
  if (!payload.sub) throw new Error("Invalid sign-in token.");

  return {
    sub: payload.sub,
    email: payload.email_verified === false ? null : payload.email ?? null,
    name: payload.name ?? null,
    picture: payload.picture ?? null,
  };
}
