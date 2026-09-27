import { useState } from 'react';
import { Plus, Pencil, Trash2, LogOut, Flame, X } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import ProductForm from '../../components/admin/ProductForm.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useProducts } from '../../context/ProductsContext.jsx';
import { createProduct, updateProduct, deleteProduct } from '../../api/products.js';
import { formatNPR } from '../../utils/currency.js';

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const { products, loading, refresh } = useProducts();
  const [modal, setModal] = useState(null); // null | 'create' | product object (edit)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate(payload) {
    await createProduct(payload);
    await refresh();
    setModal(null);
  }

  async function handleUpdate(id, payload) {
    await updateProduct(id, payload);
    await refresh();
    setModal(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteProduct(deleteTarget.id);
      await refresh();
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Seo title="Admin Dashboard" path="/admin/dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-neutral-900">Product Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">{products.length} products · manage your catalogue</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModal('create')}
              className="inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <Plus size={16} /> Add product
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-200"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-brand-cream-100 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Trending</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-neutral-400">Loading…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-neutral-400">No products yet.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-cream-100/60">
                    <td className="flex items-center gap-3 px-5 py-3">
                      <img src={product.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      <span className="font-medium text-neutral-800">{product.name}</span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{product.category}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatNPR(product.price)}</td>
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
      </main>

      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === 'create' ? 'Add product' : 'Edit product'}>
          <ProductForm
            initialProduct={modal === 'create' ? null : modal}
            submitLabel={modal === 'create' ? 'Add product' : 'Save changes'}
            onCancel={() => setModal(null)}
            onSubmit={(payload) => (modal === 'create' ? handleCreate(payload) : handleUpdate(modal.id, payload))}
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
              {busy ? 'Deleting…' : 'Delete'}
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
    </>
  );
}

function Modal({ title, onClose, children }) {
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
