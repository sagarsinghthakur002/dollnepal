"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Home, MapPin, Store, Search, Loader2 } from "lucide-react";
import { formatRs } from "@/lib/currency";

interface Branch {
  name: string;
  district: string;
}
interface Rates {
  home: number | null;
  branch: number | null;
}
type Mode = "home" | "branch";

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s(-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const label = (b: Branch) => (b.district && b.district.toLowerCase() !== b.name.toLowerCase() ? `${titleCase(b.name)}, ${titleCase(b.district)}` : titleCase(b.name));

export default function DeliveryEstimator({ weightKg }: { weightKg: number }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [rates, setRates] = useState<Rates | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [mode, setMode] = useState<Mode>("home");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ncm/branches")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { branches: Branch[] }) => !cancelled && setBranches(d.branches))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? branches.filter((b) => b.name.toLowerCase().includes(q) || b.district.toLowerCase().includes(q)) : branches;
    return list.slice(0, 40);
  }, [branches, query]);

  function choose(b: Branch) {
    setSelected(b);
    setQuery(label(b));
    setOpen(false);
    setRates(null);
    setRateError(false);
    setRateLoading(true);
    fetch(`/api/ncm/rate?destination=${encodeURIComponent(b.name)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Rates) => {
        setRates({ home: d.home, branch: d.branch });
        setMode(d.home != null ? "home" : "branch");
      })
      .catch(() => setRateError(true))
      .finally(() => setRateLoading(false));
  }

  const city = selected ? titleCase(selected.name) : "";
  const cards: { key: Mode; title: string; price: number | null | undefined; sub: string; Icon: typeof Home }[] = [
    { key: "home", title: "Home delivery", price: rates?.home, sub: selected ? `To your door in ${city}` : "To your door", Icon: Home },
    { key: "branch", title: "Branch pickup", price: rates?.branch, sub: selected ? `Collect from NCM ${city}` : "Collect from the NCM branch", Icon: Store },
  ];

  return (
    <section aria-labelledby="delivery-heading" className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
      <h2 id="delivery-heading" className="font-display text-base font-semibold text-neutral-900">Delivery to your area</h2>

      <div ref={boxRef} className="relative mt-3">
        <label htmlFor="ncm-area" className="mb-1 block text-xs font-medium text-neutral-500">Your city or area</label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="ncm-area"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="ncm-area-list"
            autoComplete="off"
            value={query}
            disabled={loadError}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder={loadError ? "Delivery areas unavailable" : branches.length ? "e.g. Pokhara, Kaski" : "Loading areas…"}
            className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-800 focus:border-burnt-500 focus:outline-none focus:ring-2 focus:ring-burnt-100 disabled:bg-neutral-50"
          />
        </div>
        {open && branches.length > 0 && (
          <ul id="ncm-area-list" role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
            {matches.length === 0 && <li className="px-4 py-2.5 text-sm text-neutral-500">No area matches “{query}”.</li>}
            {matches.map((b) => (
              <li key={b.name} role="option" aria-selected={selected?.name === b.name}>
                <button type="button" onClick={() => choose(b)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-burnt-50">
                  <MapPin size={14} className="shrink-0 text-neutral-400" />
                  {label(b)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loadError && <p className="mt-2 text-xs text-neutral-500">We couldn&apos;t load delivery areas. You can still order on WhatsApp and we&apos;ll confirm the delivery fee.</p>}
      {rateError && <p className="mt-2 text-xs text-red-600">Couldn&apos;t fetch delivery prices right now. Please try again.</p>}

      <div className="mt-3 grid grid-cols-2 gap-3" aria-live="polite">
        {cards.map(({ key, title, price, sub, Icon }) => {
          const unavailable = !!rates && price == null;
          const active = mode === key && !unavailable;
          return (
            <button
              key={key}
              type="button"
              disabled={!rates || unavailable}
              onClick={() => setMode(key)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                active ? "border-burnt-500 bg-burnt-50 ring-1 ring-burnt-500" : "border-neutral-200 bg-white hover:border-neutral-300"
              } ${!rates || unavailable ? "opacity-60" : ""}`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
                <Icon size={14} /> {title}
              </span>
              <span className="mt-1.5 block text-lg font-bold text-neutral-900">
                {rateLoading ? <Loader2 size={18} className="animate-spin text-neutral-400" /> : price != null ? formatRs(price) : "—"}
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">{unavailable ? "Not available here" : sub}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Parcel weight: {weightKg} kg. Delivery prices are for parcels up to 2 kg—heavier parcels cost more.
      </p>
    </section>
  );
}
