import { formatNPR } from "@/lib/currency";
import { formatDiscountBadge, getFinalPrice, hasDiscount } from "@/lib/pricing";

/**
 * Marketplace-style price: final price, struck-through base price and a "-XX%" badge
 * when a discount applies; otherwise just the normal price.
 */
export default function PriceDisplay({
  price,
  discountPercent,
  size = "md",
  className = "",
}: {
  price: number;
  discountPercent: number;
  size?: "md" | "lg";
  className?: string;
}) {
  const discounted = hasDiscount(discountPercent);
  const finalClass =
    size === "lg" ? "text-2xl font-bold text-brand-pink-600" : "text-[13px] font-bold text-brand-purple-700 sm:text-sm";
  const strikeClass = size === "lg" ? "text-base" : "text-xs";

  if (!discounted) {
    return <p className={`${finalClass} ${className}`}>{formatNPR(price)}</p>;
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className={finalClass}>{formatNPR(getFinalPrice(price, discountPercent))}</span>
      <span className={`${strikeClass} text-neutral-400 line-through`}>{formatNPR(price)}</span>
      <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
        {formatDiscountBadge(discountPercent)}
      </span>
    </div>
  );
}
