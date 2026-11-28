"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { UploadCloud, ImagePlus, List, Plus, X } from "lucide-react";
import { descriptionToEditorText, editorTextToDescription } from "@/lib/description";
import { formatNPR } from "@/lib/currency";
import { getFinalPrice } from "@/lib/pricing";
import type { Product, ProductCategory } from "@/lib/types";
import type { ProductInput } from "@/lib/actions/products";

const CATEGORIES: ProductCategory[] = ["Doll", "Bouquet", "Gifts", "Combo"];
const MAX_GALLERY = 10;
const MAX_COLORS = 12;
const MAX_COLOR_IMAGES = 10;

interface ColorDraft {
  key: string; // stable id for React (not saved)
  name: string;
  hex: string; // "" = no swatch colour
  images: string[];
}

let colorKeySeed = 0;
const newColorKey = () => `c${Date.now()}-${colorKeySeed++}`;

async function uploadOne(file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await upload(`products/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return blob.url;
}

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
  const [discount, setDiscount] = useState(
    initialProduct && initialProduct.discountPercent > 0 ? String(initialProduct.discountPercent) : ""
  );
  const [isOutOfStock, setIsOutOfStock] = useState(Boolean(initialProduct?.isOutOfStock));
  const [isHidden, setIsHidden] = useState(Boolean(initialProduct?.isHidden));

  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl ?? "");
  const [imagePath, setImagePath] = useState<string | null>(initialProduct?.imagePath ?? null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [gallery, setGallery] = useState<string[]>(initialProduct?.gallery ?? []);
  const [colors, setColors] = useState<ColorDraft[]>(
    (initialProduct?.colors ?? []).map((c) => ({ key: newColorKey(), name: c.name, hex: c.hex ?? "", images: c.images }))
  );
  const [busyUploads, setBusyUploads] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Uploads several photos one after another; returns the URLs that succeeded. */
  async function uploadMany(files: FileList | null, max: number): Promise<string[]> {
    if (!files || files.length === 0 || max <= 0) return [];
    setUploadError(null);
    setBusyUploads((n) => n + 1);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, max)) urls.push(await uploadOne(file));
    } catch {
      setUploadError("One or more uploads failed. Please try again.");
    } finally {
      setBusyUploads((n) => n - 1);
    }
    return urls;
  }

  async function addGalleryPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const urls = await uploadMany(e.target.files, MAX_GALLERY - gallery.length);
    e.target.value = "";
    if (urls.length) setGallery((g) => [...g, ...urls]);
  }

  async function addColorPhotos(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const current = colors.find((c) => c.key === key);
    const urls = await uploadMany(e.target.files, MAX_COLOR_IMAGES - (current?.images.length ?? 0));
    e.target.value = "";
    if (urls.length) setColors((list) => list.map((c) => (c.key === key ? { ...c, images: [...c.images, ...urls] } : c)));
  }

  function updateColor(key: string, patch: Partial<ColorDraft>) {
    setColors((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

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

    for (const c of colors) {
      if (!c.name.trim()) {
        setError("Every colour needs a name (or remove the empty colour).");
        return;
      }
      if (c.images.length === 0) {
        setError(`Please add at least one photo for the colour "${c.name.trim()}".`);
        return;
      }
    }

    const discountNum = discount === "" ? 0 : Number(discount);
    if (!Number.isFinite(discountNum) || discountNum < 0 || discountNum > 100) {
      setError("Discount must be a number between 0 and 100.");
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
        gallery,
        colors: colors.map((c) => ({ name: c.name.trim(), hex: c.hex || null, images: c.images })),
        description: editorTextToDescription(description),
        trending,
        discountPercent: discountNum,
        isOutOfStock,
        isHidden,
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
        <label htmlFor="pf-discount" className="mb-1 block text-xs font-semibold text-neutral-600">
          Discount % <span className="font-normal text-neutral-400">(optional, 0–100)</span>
        </label>
        <input
          id="pf-discount"
          type="number"
          min="0"
          max="100"
          step="any"
          inputMode="decimal"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          placeholder="0"
        />
        {Number(discount) > 0 && price !== "" && Number.isFinite(Number(price)) && (
          <p className="mt-1 text-xs text-emerald-700">
            Customers will pay <strong>{formatNPR(getFinalPrice(Number(price), Number(discount)))}</strong>{" "}
            <span className="text-neutral-400 line-through">{formatNPR(Number(price))}</span>. Your saved price stays {formatNPR(Number(price))}.
          </p>
        )}
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

      {/* ---- More photos ---- */}
      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          More photos <span className="font-normal text-neutral-400">(optional, up to {MAX_GALLERY})</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {gallery.map((url) => (
            <PhotoThumb key={url} url={url} onRemove={() => setGallery((g) => g.filter((u) => u !== url))} />
          ))}
          {gallery.length < MAX_GALLERY && <AddPhotoButton busy={busyUploads > 0} onChange={addGalleryPhotos} />}
        </div>
      </div>

      {/* ---- Colours ---- */}
      <div className="rounded-2xl bg-brand-cream-100 p-4 ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-800">Colour options</p>
            <p className="text-xs text-neutral-500">
              Add a colour with its own photos. Customers pick a colour on the product page; the photo and colour go into their order.
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {colors.map((c) => (
            <div key={c.key} className="rounded-xl bg-white p-3 ring-1 ring-black/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateColor(c.key, { name: e.target.value })}
                  maxLength={30}
                  placeholder="Colour name, e.g. Pink"
                  aria-label="Colour name"
                  className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-brand-pink-400 focus:outline-none"
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200 px-2 py-1.5 text-xs text-neutral-500" title="Optional swatch colour">
                  <input
                    type="color"
                    value={c.hex || "#ef2f87"}
                    onChange={(e) => updateColor(c.key, { hex: e.target.value })}
                    className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                    aria-label={`Swatch colour for ${c.name || "this colour"}`}
                  />
                  {c.hex ? (
                    <button type="button" onClick={() => updateColor(c.key, { hex: "" })} className="font-semibold text-neutral-500 hover:text-red-600">
                      Clear
                    </button>
                  ) : (
                    <span>Swatch</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setColors((list) => list.filter((x) => x.key !== c.key))}
                  aria-label={`Remove colour ${c.name || ""}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {c.images.map((url) => (
                  <PhotoThumb key={url} url={url} onRemove={() => updateColor(c.key, { images: c.images.filter((u) => u !== url) })} />
                ))}
                {c.images.length < MAX_COLOR_IMAGES && <AddPhotoButton busy={busyUploads > 0} onChange={(e) => addColorPhotos(c.key, e)} />}
              </div>
              {c.images.length === 0 && <p className="mt-2 text-xs text-amber-700">Add at least one photo for this colour.</p>}
            </div>
          ))}
        </div>

        {colors.length < MAX_COLORS && (
          <button
            type="button"
            onClick={() => setColors((list) => [...list, { key: newColorKey(), name: "", hex: "", images: [] }])}
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            <Plus size={15} /> Add colour
          </button>
        )}
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

      <Toggle
        label="Out of Stock"
        hint="Shows an “Out of Stock” badge and disables Add to Cart."
        checked={isOutOfStock}
        onChange={setIsOutOfStock}
        danger
      />
      <Toggle
        label="Hide product"
        hint="Completely hidden from the storefront, shop, trending and the product page. Still visible here in admin."
        checked={isHidden}
        onChange={setIsHidden}
        danger
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploadProgress !== null || busyUploads > 0}
          className="inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? "Saving…" : busyUploads > 0 ? "Uploading photos…" : submitLabel}
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
  danger = false,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? (danger ? "bg-red-500" : "brand-gradient-bg") : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400">{hint}</p>
      </div>
    </div>
  );
}

function PhotoThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream-200 ring-1 ring-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element -- previewing an arbitrary storage URL */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function AddPhotoButton({ busy, onChange }: { busy: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label
      className={`flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-neutral-300 text-[10px] font-semibold text-neutral-500 hover:border-brand-pink-400 hover:text-brand-pink-600 ${
        busy ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <ImagePlus size={18} />
      {busy ? "Uploading…" : "Add"}
      <input type="file" accept="image/*" multiple onChange={onChange} className="hidden" />
    </label>
  );
}
