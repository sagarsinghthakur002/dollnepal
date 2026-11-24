"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Flame, X } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductFlagAction,
} from "@/lib/actions/products";
import { formatNPR } from "@/lib/currency";
import { formatDiscountBadge, getFinalPrice, hasDiscount } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export default function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  function toggle(product: Product, flag: "isOutOfStock" | "isHidden") {
    const key = `${product.id}:${flag}`;
    setPendingToggle(key);
    setToggleError(null);
    startTransition(async () => {
      const result = await toggleProductFlagAction(product.id, flag, !product[flag]);
      if (!result.ok) setToggleError(result.error);
      router.refresh();
      setPendingToggle(null);
    });
  }

  function refreshAndClose() {
    router.refresh();
    setModal(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteProductAction(deleteTarget.id);
      router.refresh();
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">Products</h1>
          <p className="mt-1 text-sm text-neutral-500">{products.length} products in your catalogue</p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      {toggleError && <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{toggleError}</p>}

      <div className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-black/5">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-brand-cream-100 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Trending</th>
              <th className="px-5 py-3">Out of stock</th>
              <th className="px-5 py-3">Hidden</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-neutral-400">No products yet.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={`hover:bg-brand-cream-100/60 ${product.isHidden ? "bg-neutral-50 opacity-75" : ""}`}>
                  <td className="flex items-center gap-3 px-5 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage/emulator URL thumbnail */}
                    <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    <span className="font-medium text-neutral-800">{product.name}</span>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{product.category}</td>
                  <td className="px-5 py-3 text-neutral-600">
                    {hasDiscount(product.discountPercent) ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-800">
                          {formatNPR(getFinalPrice(product.price, product.discountPercent))}{" "}
                          <span className="rounded bg-red-50 px-1 py-0.5 text-[10px] font-bold text-red-600">
                            {formatDiscountBadge(product.discountPercent)}
                          </span>
                        </span>
                        <span className="text-xs text-neutral-400">Base: {formatNPR(product.price)}</span>
                      </div>
                    ) : (
                      formatNPR(product.price)
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {product.trending ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-pink-50 px-2.5 py-1 text-xs font-semibold text-brand-pink-600">
                        <Flame size={12} /> Trending
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Switch
                      label={`Out of stock: ${product.name}`}
                      checked={product.isOutOfStock}
                      loading={pendingToggle === `${product.id}:isOutOfStock`}
                      onClick={() => toggle(product, "isOutOfStock")}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <Switch
                      label={`Hide product: ${product.name}`}
                      checked={product.isHidden}
                      loading={pendingToggle === `${product.id}:isHidden`}
                      onClick={() => toggle(product, "isHidden")}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setModal(product)}
                        aria-label={`Edit ${product.name}`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-brand-purple-50 hover:text-brand-purple-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Delete ${product.name}`}
                        className="rounded-full p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === "create" ? "Add product" : "Edit product"}>
          <ProductForm
            initialProduct={modal === "create" ? null : modal}
            submitLabel={modal === "create" ? "Add product" : "Save changes"}
            onCancel={() => setModal(null)}
            onDone={refreshAndClose}
            onSubmit={(input) =>
              modal === "create" ? createProductAction(input) : updateProductAction(modal.id, input)
            }
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} title="Delete product">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This can&apos;t be undone.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-soft sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Switch({
  label,
  checked,
  loading,
  onClick,
}: {
  label: string;
  checked: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={loading}
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-red-500" : "bg-neutral-200"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
