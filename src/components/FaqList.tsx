import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

/** Accessible accordion (native <details>) + FAQPage structured data for search engines. */
export default function FaqList({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-neutral-900 [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown size={18} className="shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600">{item.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
