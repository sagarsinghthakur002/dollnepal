"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import SignInModal from "@/components/auth/SignInModal";
import type { SessionUser } from "@/lib/types";

export const PENDING_CART_KEY = "dollnepal_pending_cart";
const GUEST_KEY = "dollnepal_guest";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  /** True when the visitor chose "Continue as guest" (only offered if Google sign-in fails). */
  guest: boolean;
  openSignIn: (message?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Who is signed in? Read from the server (signed HttpOnly cookie).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore guest choice after mount
      setGuest(sessionStorage.getItem(GUEST_KEY) === "1");
    } catch {
      /* ignore */
    }
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data: { user: SessionUser | null }) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openSignIn = useCallback((message?: string) => {
    setError(null);
    setModalMessage(message);
    setModalOpen(true);
  }, []);

  /** Closing the dialog without signing in cancels any "add to cart" that was waiting for it. */
  const dismissSignIn = useCallback(() => {
    setModalOpen(false);
    setError(null);
    try {
      sessionStorage.removeItem(PENDING_CART_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const continueAsGuest = useCallback(() => {
    try {
      sessionStorage.setItem(GUEST_KEY, "1");
    } catch {
      /* ignore */
    }
    setGuest(true);
    setModalOpen(false); // pending cart item (if any) is added by CartContext
    setError(null);
  }, []);

  /** Called by the Google button with the signed credential; the server verifies it and sets the session cookie. */
  const handleCredential = useCallback(async (credential: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = (await res.json()) as { user?: SessionUser; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error ?? "Sign-in failed. Please try again.");
        return;
      }
      setUser(data.user);
      setModalOpen(false);
    } catch {
      setError("Network error. Check your connection and try again.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    try {
      sessionStorage.removeItem(GUEST_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
    setGuest(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, guest, openSignIn, signOut }),
    [user, loading, guest, openSignIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInModal
        open={modalOpen}
        message={modalMessage}
        error={error}
        onClose={dismissSignIn}
        onCredential={handleCredential}
        onError={setError}
        onGuest={continueAsGuest}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
