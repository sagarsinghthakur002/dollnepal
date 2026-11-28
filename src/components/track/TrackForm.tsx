"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function TrackForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track?orderId=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="track-order-id">Order ID</label>
      <input
        id="track-order-id"
        type="text"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Order ID (DN-XXXXXXXXX)"
        autoCapitalize="characters"
        className="w-full rounded-full border border-neutral-200 px-5 py-3 text-base focus:border-brand-pink-400 focus:outline-none sm:text-sm"
      />
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
      >
        <Search size={16} />
        Track
      </button>
    </form>
  );
}
