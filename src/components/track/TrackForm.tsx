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

    const isOrderId = /^DN-/i.test(trimmed);
    const params = new URLSearchParams();
    params.set(isOrderId ? "orderId" : "phone", trimmed);
    router.push(`/track?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Order ID (DN-XXXXX) or phone number"
        className="w-full rounded-full border border-neutral-200 px-5 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
      >
        <Search size={16} />
        Track
      </button>
    </form>
  );
}
