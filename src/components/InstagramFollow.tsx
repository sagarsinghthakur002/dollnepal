import InstagramIcon from "@/components/icons/InstagramIcon";
import { SITE_INFO } from "@/lib/siteInfo";

export default function InstagramFollow() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-black/5 sm:p-10">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">See new arrivals first on Instagram</h2>
        <p className="text-sm text-neutral-500">Follow {SITE_INFO.instagramHandle} for restocks and offers.</p>
        <a
          href={SITE_INFO.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white sm:w-auto"
        >
          <InstagramIcon size={18} /> Follow on Instagram
        </a>
      </div>
    </section>
  );
}
