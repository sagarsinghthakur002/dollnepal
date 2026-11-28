import Link from "next/link";

const CATEGORIES = ["All", "Doll", "Bouquet", "Gifts", "Combo"];

function buildHref(category: string, inStockOnly: boolean): string {
  const params = new URLSearchParams();
  if (category !== "All") params.set("category", category);
  if (inStockOnly) params.set("stock", "1");
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default function CategoryFilter({ active, inStockOnly = false }: { active: string; inStockOnly?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <Link
              key={cat}
              href={buildHref(cat, inStockOnly)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? "brand-gradient-bg text-white shadow-soft" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:ring-brand-pink-300"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      <Link
        href={buildHref(active, !inStockOnly)}
        role="switch"
        aria-checked={inStockOnly}
        className="inline-flex min-h-11 items-center gap-2.5 self-start text-sm font-semibold text-neutral-700"
      >
        <span className={`relative h-6 w-11 rounded-full transition-colors ${inStockOnly ? "bg-emerald-500" : "bg-neutral-300"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${inStockOnly ? "translate-x-5" : "translate-x-0.5"}`} />
        </span>
        In stock only
      </Link>
    </div>
  );
}
