"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, Truck } from "lucide-react";
import { getCourier, type Courier } from "@/lib/couriers";

/** Shows the assigned courier, its tracking ID (copyable) and a link to the courier's portal. */
export default function CourierTracking({
  courier,
  trackingId,
}: {
  courier: Courier | null;
  trackingId: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const info = getCourier(courier);

  if (!info && !trackingId) return null;

  function copy() {
    if (!trackingId) return;
    navigator.clipboard?.writeText(trackingId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mb-6 rounded-2xl bg-brand-cream-100 p-4 ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        {info ? (
          <Image src={info.logo} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-neutral-500">
            <Truck size={18} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs text-neutral-500">Courier partner</p>
          <p className="font-display text-sm font-semibold text-neutral-900">
            {info ? info.name : "Courier to be assigned"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-neutral-500">Tracking ID</p>
        {trackingId ? (
          <p className="break-all font-mono text-base font-semibold text-neutral-900">{trackingId}</p>
        ) : (
          <p className="text-sm text-neutral-500">Not assigned yet — we&apos;ll add it once your parcel is dispatched.</p>
        )}
      </div>

      {(trackingId || info) && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {trackingId && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-200 hover:bg-neutral-50 sm:w-auto"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Tracking ID"}
            </button>
          )}
          {info && (
            <a
              href={info.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white shadow-soft sm:w-auto"
            >
              <ExternalLink size={14} />
              {info.trackLabel}
            </a>
          )}
        </div>
      )}
      {info && trackingId && (
        <p className="mt-3 text-xs text-neutral-500">Copy your Tracking ID, then paste it into the {info.name.split(" (")[0]} tracking page.</p>
      )}
    </div>
  );
}
