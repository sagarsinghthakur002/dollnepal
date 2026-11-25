"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "dn-pwa-dismissed-at";
const DISMISS_DAYS = 7;

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

/** Registers the service worker and offers an "Install app" prompt (Android/desktop) or an Add-to-Home-Screen hint (iOS). */
export default function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    const onInstalled = () => {
      setDeferred(null);
      setHidden(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no install prompt event — show a how-to hint instead.
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos && isSafari) {
      timer = setTimeout(() => {
        setShowIosHint(true);
        setHidden(false);
      }, 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    setHidden(true);
  }

  if (hidden || (!deferred && !showIosHint)) return null;

  return (
    <div
      role="dialog"
      aria-label="Install DollNepal app"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white p-3 pr-2 shadow-soft ring-1 ring-black/10 sm:left-4 sm:right-auto sm:mx-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">Install DollNepal</p>
        {showIosHint && !deferred ? (
          <p className="text-xs text-neutral-500">
            Tap <Share size={12} className="inline -mt-0.5" /> Share, then &ldquo;Add to Home Screen&rdquo;.
          </p>
        ) : (
          <p className="text-xs text-neutral-500">Faster shopping &amp; order tracking from your home screen.</p>
        )}
      </div>
      {deferred && (
        <button
          type="button"
          onClick={install}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2 text-sm font-semibold text-white"
        >
          <Download size={14} />
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
