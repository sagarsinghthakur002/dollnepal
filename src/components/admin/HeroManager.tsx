"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { UploadCloud, Trash2, Link2 } from "lucide-react";
import { updateHeroSettingsAction } from "@/lib/actions/settings";
import { HERO_FALLBACK_COLOR } from "@/lib/constants";
import type { HeroSettings } from "@/lib/types";

export default function HeroManager({ initial }: { initial: HeroSettings }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");
  const [imagePath, setImagePath] = useState<string | null>(initial.imagePath);
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const dirty = (imageUrl.trim() || null) !== initial.imageUrl;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setProgress(0);
    try {
      const blob = await upload(`hero/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      setImageUrl(blob.url);
      setImagePath(blob.url);
    } catch {
      setMessage({ type: "error", text: "Upload failed. Use a JPG/PNG/WebP image under 8 MB." });
    } finally {
      setProgress(null);
    }
  }

  async function save(next: { imageUrl: string | null; imagePath: string | null }) {
    setSaving(true);
    setMessage(null);
    try {
      const result = await updateHeroSettingsAction(next);
      if (!result.ok) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "ok", text: next.imageUrl ? "Hero banner saved — it's live on the homepage." : "Banner removed — homepage uses the solid colour." });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-neutral-900">Hero banner</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Swap the homepage background for festivals (Dashain, Tihar, Holi…) anytime. Use a wide image (about 1920×800).
        A dark overlay keeps the text readable on any picture.
      </p>

      {message && (
        <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
        <div className="relative h-48 w-full sm:h-64" style={{ backgroundColor: HERO_FALLBACK_COLOR }}>
          {imageUrl.trim() && (
            // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary uploaded / external URL
            <img src={imageUrl.trim()} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" />
          <div className="relative flex h-full flex-col justify-center px-6 text-white">
            <p className="font-display text-2xl font-semibold sm:text-3xl">Gifts that say it, cutely.</p>
            <span className="mt-3 w-fit rounded-full brand-gradient-bg px-4 py-2 text-xs font-semibold">Explore the Shop</span>
          </div>
        </div>
        <p className="px-5 py-2 text-xs text-neutral-400">
          Preview {imageUrl.trim() ? "" : `— no image set, using solid ${HERO_FALLBACK_COLOR}`}
        </p>
      </div>

      <div className="mt-6 space-y-5 rounded-3xl bg-white p-5 shadow-card ring-1 ring-black/5 sm:p-6">
        <div>
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Upload banner image</span>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200">
            <UploadCloud size={16} />
            {imageUrl ? "Replace image" : "Upload from gallery"}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {progress !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full brand-gradient-bg transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="hero-url" className="mb-1 flex items-center gap-1 text-xs font-semibold text-neutral-600">
            <Link2 size={12} /> …or paste an image URL
          </label>
          <input
            id="hero-url"
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImagePath(null);
            }}
            placeholder="https://…"
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-base focus:border-brand-pink-400 focus:outline-none sm:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={saving || progress !== null || !dirty}
            onClick={() => save({ imageUrl: imageUrl.trim() || null, imagePath })}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Saving…" : "Save banner"}
          </button>
          {(initial.imageUrl || imageUrl) && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setImageUrl("");
                setImagePath(null);
                save({ imageUrl: null, imagePath: null });
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 sm:w-auto"
            >
              <Trash2 size={15} /> Remove image (use {HERO_FALLBACK_COLOR})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
