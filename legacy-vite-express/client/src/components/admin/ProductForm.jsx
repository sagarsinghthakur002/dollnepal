import { useEffect, useState } from 'react';

const CATEGORIES = ['Doll', 'Bouquet', 'Gifts', 'Combo'];
const EMPTY_FORM = { name: '', category: 'Doll', price: '', image: '', description: '', trending: false };

export default function ProductForm({ initialProduct, onSubmit, onCancel, submitLabel = 'Save product' }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        name: initialProduct.name || '',
        category: initialProduct.category || 'Doll',
        price: initialProduct.price ?? '',
        image: initialProduct.image || '',
        description: initialProduct.description || '',
        trending: Boolean(initialProduct.trending),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialProduct]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.image.trim() || form.price === '') {
      setError('Please fill in name, price and image URL.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, price: Number(form.price) });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <div>
        <label htmlFor="pf-name" className="mb-1 block text-xs font-semibold text-neutral-600">Product name</label>
        <input
          id="pf-name"
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          placeholder="e.g. Sakura Blossom Doll"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-category" className="mb-1 block text-xs font-semibold text-neutral-600">Category</label>
          <select
            id="pf-category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pf-price" className="mb-1 block text-xs font-semibold text-neutral-600">Price (NPR)</label>
          <input
            id="pf-price"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
            placeholder="1500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pf-image" className="mb-1 block text-xs font-semibold text-neutral-600">Image URL</label>
        <input
          id="pf-image"
          type="text"
          value={form.image}
          onChange={(e) => updateField('image', e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="pf-description" className="mb-1 block text-xs font-semibold text-neutral-600">Description</label>
        <textarea
          id="pf-description"
          rows={3}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-brand-pink-400 focus:outline-none"
          placeholder="Short, playful product description"
        />
      </div>

      <label className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.trending}
          onClick={() => updateField('trending', !form.trending)}
          className={`relative h-6 w-11 rounded-full transition-colors ${form.trending ? 'brand-gradient-bg' : 'bg-neutral-200'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              form.trending ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-neutral-700">Mark as trending 🔥</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
