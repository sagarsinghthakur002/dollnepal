import Link from "next/link";

const CATEGORIES = ["All", "Doll", "Bouquet", "Gifts", "Combo"];

export default function CategoryFilter({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        const href = cat === "All" ? "/shop" : `/shop?category=${cat}`;
        return (
          <Link
            key={cat}
            href={href}
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
  );
}
