import { useState } from 'react';
import { Mail, Phone, Music2, MessageCircle, MapPin } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import InstagramIcon from '../components/icons/InstagramIcon.jsx';
import { buildGeneralWhatsAppLink } from '../utils/whatsapp.js';

export default function Contact() {
  const [message, setMessage] = useState('');

  const whatsappHref = buildGeneralWhatsAppLink(
    message.trim() ? `Hello DollNepal! ${message.trim()}` : 'Hello DollNepal! I have a question.'
  );

  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with DollNepal on WhatsApp, email or Instagram. We reply fast and ship across Nepal and abroad."
        path="/contact"
      />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
            Let&apos;s <span className="brand-gradient-text">chat</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Questions about an order, custom gifts, or bulk hampers? We&apos;re a message away.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-neutral-900">Send us a quick message</h2>
            <p className="mt-1 text-sm text-neutral-500">We&apos;ll open WhatsApp with your message pre-filled.</p>

            <label htmlFor="contact-message" className="sr-only">Your message</label>
            <textarea
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd like to ask about..."
              className="mt-4 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 focus:border-brand-pink-400 focus:outline-none"
            />

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full brand-gradient-bg px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
            >
              <MessageCircle size={18} />
              Send on WhatsApp
            </a>
          </article>

          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
              <h2 className="font-display text-lg font-semibold text-neutral-900">Reach us directly</h2>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li className="flex items-center gap-2.5">
                  <Phone size={17} className="text-brand-pink-500" />
                  <a href="tel:+9779761302887" className="hover:text-brand-pink-600">+977-9761302887</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={17} className="text-brand-pink-500" />
                  <a href="mailto:dollnepal.np@gmail.com" className="hover:text-brand-pink-600">dollnepal.np@gmail.com</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin size={17} className="text-brand-pink-500" />
                  Kathmandu, Nepal — delivering nationwide
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5">
              <h2 className="font-display text-lg font-semibold text-neutral-900">Follow along</h2>
              <div className="mt-4 flex items-center gap-3">
                <a href="#" className="inline-flex items-center gap-2 rounded-full bg-brand-pink-50 px-4 py-2 text-sm font-semibold text-brand-pink-600 hover:bg-brand-pink-100">
                  <InstagramIcon size={16} /> @dollnepal.np
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-full bg-brand-purple-50 px-4 py-2 text-sm font-semibold text-brand-purple-600 hover:bg-brand-purple-100">
                  <Music2 size={16} /> @Dollnepal
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
