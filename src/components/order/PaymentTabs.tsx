"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Copy, Check, BadgeCheck, UploadCloud, X } from "lucide-react";
import { markPaymentSubmittedAction } from "@/lib/actions/orders";
import type { PaymentStatus } from "@/lib/types";

type PayTab = "esewa" | "khalti" | "bank";

const PAY_METHODS: Record<
  PayTab,
  {
    label: string;
    qr: string;
    alt: string;
    holder: string;
    copyValue: string;
    copyLabel: string;
    details?: { label: string; value: string }[];
  }
> = {
  esewa: {
    label: "eSewa",
    qr: "/payment/esewa-qr.png",
    alt: "eSewa QR code for Sagar Thakur",
    holder: "Sagar Thakur",
    copyValue: "9823407226",
    copyLabel: "9823407226",
  },
  khalti: {
    label: "Khalti",
    qr: "/payment/khalti-qr.png",
    alt: "Khalti QR code for Sagar Thakur",
    holder: "Sagar Thakur",
    copyValue: "9823407226",
    copyLabel: "9823407226",
  },
  bank: {
    label: "Prabhu Bank",
    qr: "/payment/prabhu-qr.png",
    alt: "Prabhu Bank QR code for Sagar Thakur",
    holder: "SAGAR THAKUR",
    copyValue: "1140198400600015",
    copyLabel: "1140198400600015",
    details: [
      { label: "Bank", value: "Prabhu Bank" },
      { label: "Account Holder", value: "SAGAR THAKUR" },
      { label: "Account Number", value: "1140198400600015" },
      { label: "Branch", value: "TEKU BRANCH" },
    ],
  },
};

export default function PaymentTabs({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<PayTab>("esewa");
  const method = PAY_METHODS[tab];
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  // Local preview of the chosen screenshot; revoke the object URL when replaced.
  useEffect(() => {
    if (!proofFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setFileError(null);
    if (!file) return;
    const okType = ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!okType) {
      setFileError("Please choose a .jpg, .jpeg or .png image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Image is too large (max 5 MB).");
      return;
    }
    setProofFile(file);
    setConfirming(false);
  }

  function copyId(value: string) {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleConfirmPaid() {
    if (!proofFile) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const safeName = proofFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await upload(`payment-proofs/${orderId}/${Date.now()}-${safeName}`, proofFile, {
        access: "public",
        handleUploadUrl: "/api/upload-proof",
        clientPayload: orderId,
        contentType: proofFile.type || undefined,
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      const result = await markPaymentSubmittedAction(orderId, tab, blob.url);
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setSubmitError("Upload failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
      setProgress(null);
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
    <div className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-black/5 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-neutral-900">Pay with</h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(Object.keys(PAY_METHODS) as PayTab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => { setTab(key); setCopied(false); }}
            className={`min-h-11 rounded-full px-2 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              tab === key ? "brand-gradient-bg text-white shadow-soft" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {PAY_METHODS[key].label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <div className="relative aspect-square w-full max-w-[16rem] overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-neutral-200">
          <Image
            src={method.qr}
            alt={method.alt}
            fill
            sizes="(max-width: 768px) 70vw, 256px"
            className="object-contain p-2"
          />
        </div>

        {method.details ? (
          <dl className="mt-4 grid w-full grid-cols-1 gap-3 rounded-2xl bg-neutral-50 p-4 text-left text-sm sm:grid-cols-2">
            {method.details.map((d) => (
              <div key={d.label} className="min-w-0">
                <dt className="text-xs text-neutral-500">{d.label}</dt>
                <dd className="break-words font-semibold text-neutral-900">{d.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-4 w-full rounded-2xl bg-neutral-50 p-4 text-sm">
            <p className="text-xs text-neutral-500">Display name</p>
            <p className="font-semibold text-neutral-900">{method.holder}</p>
            <p className="mt-2 text-xs text-neutral-500">Mobile / ID</p>
            <p className="font-semibold text-neutral-900">{method.copyLabel}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => copyId(method.copyValue)}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 sm:w-auto"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : tab === "bank" ? `Copy account number` : `Copy mobile number`}
        </button>

        <p className="mt-3 max-w-xs text-xs text-neutral-500">
          Scan the QR code or send payment to the details above, then upload your payment screenshot and tap &quot;I Have Paid&quot;.
        </p>

        <div className="mt-5 w-full text-left">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Upload Payment Screenshot / Proof</span>
          {previewUrl ? (
            <div className="relative rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview */}
              <img src={previewUrl} alt="Payment screenshot preview" className="mx-auto max-h-64 rounded-xl object-contain" />
              <p className="mt-2 truncate text-center text-xs text-neutral-500">{proofFile?.name}</p>
              <button
                type="button"
                onClick={() => { setProofFile(null); setConfirming(false); }}
                disabled={submitting}
                aria-label="Remove screenshot"
                className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-neutral-600 shadow hover:text-red-600 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 px-4 py-6 text-center text-sm font-semibold text-neutral-600 hover:border-brand-pink-400">
              <UploadCloud size={22} />
              Upload Payment Screenshot / Proof
              <span className="text-xs font-normal text-neutral-400">.jpg, .jpeg or .png · max 5 MB</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleProofChange}
                className="hidden"
              />
            </label>
          )}
          {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
        </div>

        {confirming ? (
          <div className="mt-5 w-full rounded-2xl bg-brand-cream-100 p-4">
            <p className="text-sm text-neutral-700">
              Confirm you&apos;ve sent the payment via <strong>{method.label}</strong>?
              We&apos;ll save your screenshot with the order, mark it as awaiting verification and reach out on WhatsApp shortly.
            </p>
            {progress !== null && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full brand-gradient-bg transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={submitting}
                className="min-h-12 w-full flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Uploading & submitting…" : "Yes, I've paid"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="min-h-11 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!proofFile}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            I Have Paid
          </button>
        )}
        {!proofFile && !confirming && (
          <p className="mt-2 text-xs text-neutral-400">Upload your screenshot to enable this button.</p>
        )}
        {submitError && <p className="mt-2 text-xs text-red-600">{submitError}</p>}
      </div>
    </div>
  );
}
