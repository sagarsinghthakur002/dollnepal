import Link from "next/link";
import { Globe2 } from "lucide-react";

export default function SendFromAbroadBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col items-start gap-5 rounded-3xl brand-gradient-bg p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="flex items-start gap-4">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 sm:flex">
            <Globe2 size={24} />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold">Sending a gift from abroad?</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/90">
              Choose the gift, pay from anywhere, and we&apos;ll deliver it to your family anywhere in Nepal.
            </p>
          </div>
        </div>
        <Link
          href="/send-gifts-to-nepal"
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-purple-700 shadow-soft transition-transform hover:scale-105 sm:w-auto"
        >
          How it works
        </Link>
      </div>
    </section>
  );
}
