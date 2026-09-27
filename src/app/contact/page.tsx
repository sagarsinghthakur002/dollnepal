import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with DollNepal on WhatsApp, email or Instagram. We reply fast and ship across Nepal and abroad.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
          Let&apos;s <span className="brand-gradient-text">chat</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Questions about an order, custom gifts, or bulk hampers? We&apos;re a message away.
        </p>
      </header>

      <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
        <ul className="space-y-4 text-sm text-neutral-700">
          <li className="flex items-center gap-3">
            <Phone size={18} className="text-brand-pink-500" />
            <a href="tel:+9779761302887" className="hover:text-brand-pink-600">+977-9761302887</a>
          </li>
          <li className="flex items-center gap-3">
            <Mail size={18} className="text-brand-pink-500" />
            <a href="mailto:dollnepal.np@gmail.com" className="hover:text-brand-pink-600">dollnepal.np@gmail.com</a>
          </li>
          <li className="flex items-center gap-3">
            <MapPin size={18} className="text-brand-pink-500" />
            Kathmandu, Nepal — delivering nationwide
          </li>
          <li className="flex items-center gap-3">
            <InstagramIcon size={18} className="text-brand-pink-500" />
            @dollnepal.np
          </li>
        </ul>

        <a
          href={buildGeneralWhatsAppLink("Hello DollNepal! I have a question.")}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
        >
          <MessageCircle size={18} />
          Chat on WhatsApp
        </a>
      </article>
    </main>
  );
}
