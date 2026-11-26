"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import SignInModal from "@/components/auth/SignInModal";

export const PENDING_CART_KEY = "dollnepal_pending_cart";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Opens the Google / Apple sign-in dialog. `message` is shown at the top of it. */
  openSignIn: (message?: string) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyError(err: unknown): string | null {
  const code = (err as { code?: string })?.code ?? "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null; // user backed out
  if (code === "auth/unauthorized-domain") return "This website address isn't authorised for sign-in yet. Please contact DollNepal.";
  if (code === "auth/operation-not-allowed") return "This sign-in method isn't enabled yet. Please try another one.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection and try again.";
  return "Sign-in failed. Please try again.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(clientAuth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) setModalOpen(false);
    });
    // Completes a redirect-based sign-in (used as a fallback when popups are blocked).
    getRedirectResult(clientAuth).catch(() => {});
    return unsub;
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

  const runSignIn = useCallback(async (provider: GoogleAuthProvider | OAuthProvider, which: "google" | "apple") => {
    setError(null);
    setBusy(which);
    try {
      await signInWithPopup(clientAuth, provider);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
        // Popups don't work everywhere (some in-app browsers / installed apps): fall back to a full-page redirect.
        try {
          await signInWithRedirect(clientAuth, provider);
          return;
        } catch (err2) {
          setError(friendlyError(err2));
        }
      } else {
        setError(friendlyError(err));
      }
    } finally {
      setBusy(null);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await runSignIn(provider, "google");
  }, [runSignIn]);

  const signInWithApple = useCallback(async () => {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    await runSignIn(provider, "apple");
  }, [runSignIn]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(clientAuth);
  }, []);

  const getIdToken = useCallback(async () => {
    const current = clientAuth.currentUser;
    return current ? current.getIdToken() : null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, openSignIn, signInWithGoogle, signInWithApple, signOut, getIdToken }),
    [user, loading, openSignIn, signInWithGoogle, signInWithApple, signOut, getIdToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInModal
        open={modalOpen}
        message={modalMessage}
        error={error}
        busy={busy}
        onClose={dismissSignIn}
        onGoogle={signInWithGoogle}
        onApple={signInWithApple}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
