"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { UploadCloud, ImagePlus, List } from "lucide-react";
import { descriptionToEditorText, editorTextToDescription } from "@/lib/description";
import type { Product, ProductCategory } from "@/lib/types";
import type { ProductInput } from "@/lib/actions/products";

const CATEGORIES: ProductCategory[] = ["Doll", "Bouquet", "Gifts", "Combo"];

interface Props {
  initialProduct?: Product | null;
  onSubmit: (input: ProductInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDone: () => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function ProductForm({
  initialProduct,
  onSubmit,
  onDone,
  onCancel,
  submitLabel = "Save product",
}: Props) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [category, setCategory] = useState<string>(initialProduct?.category ?? "Doll");
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : "");
  const [weight, setWeight] = useState(
    initialProduct && initialProduct.weight > 0 ? String(initialProduct.weight) : ""
  );
  const [description, setDescription] = useState(
    descriptionToEditorText(initialProduct?.description ?? "")
  );
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [trending, setTrending] = useState(Boolean(initialProduct?.trending));

  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl ?? "");
  const [imagePath, setImagePath] = useState<string | null>(initialProduct?.imagePath ?? null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadProgress(0);

    const path = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    try {
      const blob = await upload(path, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (progress) => {
          setUploadProgress(Math.round(progress.percentage));
        },
      });
      setImageUrl(blob.url);
      setImagePath(blob.url);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploadProgress(null);
    }
  }

  // --- Bullet-point editor helpers -----------------------------------------
  function setDescWithCursor(value: string, cursor: number) {
    setDescription(value);
    requestAnimationFrame(() => {
      descRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function handleDescKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.slice(lineStart, start);

    // Enter on an empty bullet ends the list (removes the dangling "• ").
    if (currentLine.trim() === "•") {
      const next = value.slice(0, lineStart) + value.slice(end);
      setDescWithCursor(next, lineStart);
      return;
    }
    const insert = "\n• ";
    setDescWithCursor(value.slice(0, start) + insert + value.slice(end), start + insert.length);
  }

  function handleDescFocus() {
    if (!description.trim()) setDescWithCursor("• ", 2);
  }

  function handleDescChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Make sure every non-empty line keeps its bullet (covers pasted plain text).
    const value = e.target.value
      .split("\n")
      .map((line) => (line.trim() && !/^\s*•/.test(line) ? `• ${line.replace(/^\s*[-*·]\s*/, "")}` : line))
      .join("\n");
    setDescription(value);
  }

  function insertBullet() {
    const el = descRef.current;
    const value = description;
    const pos = el?.selectionStart ?? value.length;
    const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
    const lineEnd = value.indexOf("\n", pos) === -1 ? value.length : value.indexOf("\n", pos);
    const line = value.slice(lineStart, lineEnd);
    if (line.trim() === "") {
      setDescWithCursor(value.slice(0, lineStart) + "• " + value.slice(lineEnd), lineStart + 2);
    } else {
      const prefix = value && !value.endsWith("\n") ? "\n" : "";
      setDescWithCursor(value + prefix + "• ", (value + prefix + "• ").length);
    }
    el?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !imageUrl || price === "") {
      setError("Please fill in name, price and upload an image.");
      return;
    }
    const weightNum = Number(weight);
    if (weight === "" || !Number.isFinite(weightNum) || weightNum <= 0) {
      setError("Please enter the product weight in kg (greater than 0).");
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        name,
        category,
        price: Number(price),
        weight: weightNum,
        imageUrl,
        imagePath,
        description: editorTextToDescription(description),
        trending,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <div>
        <label htmlFor="pf-name" className="mb-1 block text-xs font-semibold text-neutral-600">
          Product name
        </label>
        <input
          id="pf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          placeholder="e.g. Sakura Blossom Doll"
        />
      </div>

      <div>
        <div>
          <label htmlFor="pf-category" className="mb-1 block text-xs font-semibold text-neutral-600">
            Category
          </label>
          <select
            id="pf-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-price" className="mb-1 block text-xs font-semibold text-neutral-600">
            Price (NPR)
          </label>
          <input
            id="pf-price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
            placeholder="1500"
          />
        </div>
        <div>
          <label htmlFor="pf-weight" className="mb-1 block text-xs font-semibold text-neutral-600">
            Weight (in kg)
          </label>
          <input
            id="pf-weight"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
            placeholder="0.5"
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-600">Product photo</span>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-cream-200 ring-1 ring-black/5">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- previewing an arbitrary Storage/emulator URL
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={22} className="text-neutral-400" />
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200">
            <UploadCloud size={16} />
            {imageUrl ? "Replace photo" : "Upload from gallery"}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
        {uploadProgress !== null && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full brand-gradient-bg transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="pf-description" className="block text-xs font-semibold text-neutral-600">
            Description <span className="font-normal text-neutral-400">(one bullet per line)</span>
          </label>
          <button
            type="button"
            onClick={insertBullet}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
          >
            <List size={13} /> Add bullet
          </button>
        </div>
        <textarea
          id="pf-description"
          ref={descRef}
          rows={6}
          value={description}
          onFocus={handleDescFocus}
          onChange={handleDescChange}
          onKeyDown={handleDescKeyDown}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm leading-relaxed focus:border-brand-pink-400 focus:outline-none"
          placeholder={"• Handmade soft-fabric doll\n• 30 cm tall\n• Comes in a gift box"}
        />
        <p className="mt-1 text-xs text-neutral-400">Press Enter for a new bullet; Enter on an empty bullet ends the list.</p>
      </div>

      <label className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={trending}
          onClick={() => setTrending((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${trending ? "brand-gradient-bg" : "bg-neutral-200"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              trending ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-neutral-700">Mark as trending 🔥</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploadProgress !== null}
          className="inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
