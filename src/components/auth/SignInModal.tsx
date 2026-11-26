"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GIS_SRC = "https://accounts.google.com/gsi/client";

interface GoogleIdApi {
  initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; use_fedcm_for_prompt?: boolean }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

let gisPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisPromise = null;
        reject(new Error("load failed"));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

export default function SignInModal({
  open,
  message,
  error,
  onClose,
  onCredential,
  onError,
  onGuest,
}: {
  open: boolean;
  message?: string;
  error: string | null;
  onClose: () => void;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
  onGuest: () => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Render Google's official "Sign in with Google" button.
  useEffect(() => {
    if (!open) return;
    if (!CLIENT_ID) {
      onError("Google sign-in isn't set up yet.");
      return;
    }
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: 280,
        });
        setReady(true);
      })
      .catch(() => onError("Couldn't load Google sign-in. Check your connection or any ad-blocker."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Sign in">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 pb-8 shadow-soft sm:rounded-3xl sm:pb-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
        >
          <X size={18} />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={56} height={56} className="mx-auto h-14 w-14 rounded-full ring-2 ring-brand-gold-300" />
        <h2 className="mt-4 text-center font-display text-xl font-semibold text-neutral-900">Sign in to DollNepal</h2>
        <p className="mt-1.5 text-center text-sm text-neutral-500">
          {message ?? "Sign in to see your orders and shopping history anytime."}
        </p>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-center text-sm text-red-600">{error}</p>}

        {/* Google renders its own button inside this box */}
        <div className="mt-5 flex min-h-11 justify-center">
          <div ref={buttonRef} aria-busy={!ready} />
        </div>

        {/* Safety valve: if sign-in can't work, never block someone from shopping. */}
        {error && (
          <button
            type="button"
            onClick={onGuest}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            Continue as guest instead
          </button>
        )}

        <p className="mt-4 text-center text-xs text-neutral-400">
          We only use your name and email to link your orders to your account.
        </p>
      </div>
    </div>
  );
}
