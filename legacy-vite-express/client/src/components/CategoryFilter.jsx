const CATEGORIES = ['All', 'Doll', 'Bouquet', 'Gifts', 'Combo'];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
      {CATEGORIES.map((cat) => {
        const active = value === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? 'brand-gradient-bg text-white shadow-soft'
                : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:ring-brand-pink-300'
            }`}
            aria-pressed={active}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
