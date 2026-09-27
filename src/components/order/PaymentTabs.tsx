"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Copy, Check, BadgeCheck } from "lucide-react";
import { markPaymentSubmittedAction } from "@/lib/actions/orders";
import type { PaymentStatus } from "@/lib/types";

const ESEWA_ID_PLACEHOLDER = "9761302887 (eSewa ID — update in PaymentTabs.tsx)";
const FONPAY_ID_PLACEHOLDER = "DollNepal (Fonpay Merchant — update in PaymentTabs.tsx)";

export default function PaymentTabs({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"esewa" | "fonpay">("esewa");
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function copyId(value: string) {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleConfirmPaid() {
    setSubmitting(true);
    try {
      await markPaymentSubmittedAction(orderId, tab);
      router.refresh();
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  }

  if (paymentStatus === "paid") {
    return (
      <div className="rounded-3xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
        <BadgeCheck size={28} className="mx-auto text-emerald-600" />
        <p className="mt-2 font-display text-lg font-semibold text-emerald-800">Payment confirmed</p>
        <p className="text-sm text-emerald-700">Thank you! Your order is being processed.</p>
      </div>
    );
  }

  if (paymentStatus === "pending_verification") {
    return (
      <div className="rounded-3xl bg-amber-50 p-6 text-center ring-1 ring-amber-200">
        <BadgeCheck size={28} className="mx-auto text-amber-600" />
        <p className="mt-2 font-display text-lg font-semibold text-amber-800">Payment pending verification</p>
        <p className="text-sm text-amber-700">
          We&apos;ve received your confirmation and are verifying your payment. We&apos;ll message you on WhatsApp shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-neutral-900">Pay with</h2>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("esewa")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "esewa" ? "brand-gradient-bg text-white shadow-soft" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          eSewa
        </button>
        <button
          type="button"
          onClick={() => setTab("fonpay")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "fonpay" ? "brand-gradient-bg text-white shadow-soft" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          Fonpay
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="relative h-48 w-48 overflow-hidden rounded-2xl ring-1 ring-neutral-200">
          <Image
            src={tab === "esewa" ? "/payment/esewa-qr-placeholder.svg" : "/payment/fonpay-qr-placeholder.svg"}
            alt={tab === "esewa" ? "eSewa QR code" : "Fonpay QR code"}
            fill
            sizes="192px"
            className="object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => copyId(tab === "esewa" ? ESEWA_ID_PLACEHOLDER : FONPAY_ID_PLACEHOLDER)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {tab === "esewa" ? ESEWA_ID_PLACEHOLDER : FONPAY_ID_PLACEHOLDER}
        </button>

        <p className="mt-3 max-w-xs text-xs text-neutral-500">
          Scan the QR code or send payment to the ID above, then tap &quot;I Have Paid&quot; below.
        </p>

        {confirming ? (
          <div className="mt-5 w-full rounded-2xl bg-brand-cream-100 p-4">
            <p className="text-sm text-neutral-700">
              Confirm you&apos;ve sent the payment via <strong>{tab === "esewa" ? "eSewa" : "Fonpay"}</strong>?
              We&apos;ll mark your order as awaiting verification and reach out on WhatsApp shortly.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={submitting}
                className="flex-1 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Yes, I've paid"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            I Have Paid
          </button>
        )}
      </div>
    </div>
  );
}
