"use client";

import { useEffect } from "react";
import { Loader2, X } from "lucide-react";

// Apple sign-in needs an Apple Developer account + Firebase setup (see README). Show the button only once enabled.
const APPLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_APPLE_SIGNIN === "true";

export default function SignInModal({
  open,
  message,
  error,
  busy,
  onClose,
  onGoogle,
  onApple,
}: {
  open: boolean;
  message?: string;
  error: string | null;
  busy: "google" | "apple" | null;
  onClose: () => void;
  onGoogle: () => void;
  onApple: () => void;
}) {
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
          {message ?? "Sign in to save your cart and see your shopping history anytime."}
        </p>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy !== null}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            {busy === "google" ? <Loader2 size={18} className="animate-spin" /> : <GoogleLogo />}
            Continue with Google
          </button>

          {APPLE_ENABLED && (
            <button
              type="button"
              onClick={onApple}
              disabled={busy !== null}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {busy === "apple" ? <Loader2 size={18} className="animate-spin" /> : <AppleLogo />}
              Continue with Apple
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400">
          We only use your name and email to link your orders to your account.
        </p>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}
