import Link from "next/link";

const STEPS = [
  { title: "Choose a gift", body: "Browse the shop and add your favourites to the cart." },
  { title: "Add your location", body: "Pick Inside or Outside Kathmandu Valley. You see the exact delivery fee before you pay." },
  { title: "Pay and track", body: "Pay by eSewa, Khalti or bank transfer, then track your parcel with your Order ID." },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-brand-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id="how-heading" className="font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">How ordering works</h2>
          <Link href="/help#how-to-order" className="shrink-0 text-sm font-semibold text-neutral-700 hover:text-brand-pink-600">
            Full guide →
          </Link>
        </div>
        <ol className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient-bg text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-neutral-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
