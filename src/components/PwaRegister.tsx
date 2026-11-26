"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform =
  | "ios-safari"
  | "ios-other"
  | "android-firefox"
  | "android-samsung"
  | "android-other"
  | "desktop-safari"
  | "desktop-firefox"
  | "desktop-chromium";

export const INSTALL_EVENT = "dn:install";
const DISMISS_KEY = "dn-pwa-dismissed-at";
const DISMISS_DAYS = 7;

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac, so also check for touch support.
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (isIos) {
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua);
    return otherBrowser ? "ios-other" : "ios-safari";
  }
  if (/Android/.test(ua)) {
    if (/Firefox/.test(ua)) return "android-firefox";
    if (/SamsungBrowser/.test(ua)) return "android-samsung";
    return "android-other";
  }
  if (/Firefox/.test(ua)) return "desktop-firefox";
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)) return "desktop-safari";
  return "desktop-chromium";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function instructions(platform: Platform): { title: string; steps: string[]; note?: string } {
  switch (platform) {
    case "ios-safari":
      return {
        title: "Install on iPhone / iPad",
        steps: [
          "Tap the Share button (the square with an arrow) at the bottom of Safari.",
          "Scroll down and tap “Add to Home Screen”.",
          "Tap “Add” — DollNepal now opens like an app.",
        ],
      };
    case "ios-other":
      return {
        title: "Install on iPhone / iPad",
        steps: [
          "Tap the Share icon next to the address bar (or the ⋯ menu).",
          "Choose “Add to Home Screen”.",
          "Tap “Add” — DollNepal now opens like an app.",
        ],
        note: "Don't see “Add to Home Screen”? Open this website in Safari and follow the same steps.",
      };
    case "android-firefox":
      return {
        title: "Install on Android (Firefox)",
        steps: ["Tap the ⋮ menu at the top right.", "Tap “Install” (or “Add to Home screen”).", "Confirm with “Add”."],
      };
    case "android-samsung":
      return {
        title: "Install on Samsung Internet",
        steps: [
          "Tap the menu (≡) at the bottom right.",
          "Tap “Add page to” and choose “Home screen” (or “Install app”).",
          "Confirm with “Add”.",
        ],
      };
    case "android-other":
      return {
        title: "Install on Android",
        steps: [
          "Tap the ⋮ menu in your browser.",
          "Tap “Install app” or “Add to Home screen”.",
          "Confirm with “Install” / “Add”.",
        ],
      };
    case "desktop-safari":
      return {
        title: "Install on Mac (Safari)",
        steps: ["In the menu bar, click File.", "Click “Add to Dock…”.", "Click “Add”."],
        note: "Needs macOS Sonoma (14) or newer.",
      };
    case "desktop-firefox":
      return {
        title: "Install on a computer",
        steps: [
          "Firefox on computers can't install websites as apps.",
          "Open this website in Chrome or Edge, then click the install icon in the address bar.",
          "Or press Ctrl+D (Cmd+D on Mac) to bookmark DollNepal.",
        ],
      };
    default:
      return {
        title: "Install on your computer",
        steps: [
          "Click the install icon at the right end of the address bar (or open the ⋮ menu).",
          "Choose “Install DollNepal”.",
          "Click “Install”.",
        ],
      };
  }
}

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return Boolean(at) && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

/**
 * Registers the service worker and helps people install the app on every browser:
 *  - Chrome / Edge / Samsung / Opera (Android + desktop): native install prompt.
 *  - iPhone / iPad (Safari, Chrome, Edge, Firefox) and Firefox / Safari desktop: no install API exists,
 *    so we show step-by-step "Add to Home Screen" instructions for the visitor's own browser.
 * The "Install app" buttons (menu / footer) fire INSTALL_EVENT to open this at any time.
 */
export default function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop-chromium");
  const [standalone, setStandalone] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  async function runNativePrompt(): Promise<boolean> {
    const event = deferredRef.current;
    if (!event) return false;
    await event.prompt();
    await event.userChoice.catch(() => {});
    deferredRef.current = null;
    setDeferred(null);
    setBannerVisible(false);
    setSheetOpen(false);
    return true;
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const detected = detectPlatform();
    const installed = isStandalone();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only detection after mount
    setPlatform(detected);
    setStandalone(installed);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const canShowBanner = !installed && !recentlyDismissed();

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setDeferred(e as BeforeInstallPromptEvent);
      if (canShowBanner) setBannerVisible(true);
    };
    const onInstalled = () => {
      setDeferred(null);
      setBannerVisible(false);
      setSheetOpen(false);
      setStandalone(true);
    };
    // Native prompt where the browser offers one, otherwise show browser-specific instructions.
    const onInstallRequest = async () => {
      if (!(await runNativePrompt())) setSheetOpen(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener(INSTALL_EVENT, onInstallRequest);

    // No install event on iPhone/iPad — nudge once with the how-to banner.
    if (canShowBanner && (detected === "ios-safari" || detected === "ios-other")) {
      timer = setTimeout(() => setBannerVisible(true), 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener(INSTALL_EVENT, onInstallRequest);
      if (timer) clearTimeout(timer);
    };
  }, []);

  async function installNow() {
    if (!(await runNativePrompt())) setSheetOpen(true);
  }

  function dismissBanner() {
    setBannerVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  const guide = instructions(platform);

  return (
    <>
      {bannerVisible && !sheetOpen && !standalone && (
        <div
          role="dialog"
          aria-label="Install DollNepal app"
          className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white p-3 pr-2 shadow-soft ring-1 ring-black/10 sm:left-4 sm:right-auto sm:mx-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900">Install DollNepal</p>
            <p className="text-xs text-neutral-500">Faster shopping &amp; order tracking from your home screen.</p>
          </div>
          <button
            type="button"
            onClick={installNow}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2 text-sm font-semibold text-white"
          >
            <Download size={14} />
            {deferred ? "Install" : "How"}
          </button>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Install instructions">
          <button type="button" aria-label="Close" onClick={() => setSheetOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 pb-8 shadow-soft sm:rounded-3xl sm:pb-6">
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" width={56} height={56} className="mx-auto h-14 w-14 rounded-2xl" />

            {standalone ? (
              <>
                <h2 className="mt-4 text-center font-display text-xl font-semibold text-neutral-900">You&apos;re using the app 🎉</h2>
                <p className="mt-1.5 text-center text-sm text-neutral-500">DollNepal is already installed on this device.</p>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-center font-display text-xl font-semibold text-neutral-900">{guide.title}</h2>
                <ol className="mt-4 space-y-3">
                  {guide.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-neutral-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full brand-gradient-bg text-xs font-bold text-white">{i + 1}</span>
                      <span>
                        {i === 0 && (platform === "ios-safari" || platform === "ios-other") && (
                          <Share size={14} className="mr-1 inline -mt-0.5 text-brand-purple-600" />
                        )}
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                {guide.note && <p className="mt-4 rounded-xl bg-brand-cream-100 px-3.5 py-2.5 text-xs text-neutral-600">{guide.note}</p>}
              </>
            )}

            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
