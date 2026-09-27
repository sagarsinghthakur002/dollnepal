import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Music2, Send } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // Prototype UI only — wire this up to an email provider (Mailchimp, Brevo, etc.) later.
    setSubscribed(true);
    setEmail('');
  }

  return (
    <footer className="border-t border-brand-pink-100 bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="DollNepal logo" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-gold-300" />
            <span className="font-display text-xl font-semibold text-white">DollNepal</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            DollNepal brings joy through premium dolls, fresh bouquets and curated gifts —
            crafted with love and delivered across Nepal, with shipping options for the
            Nepali diaspora abroad. Cute gifts, dolls, love — that&apos;s us.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 flex max-w-sm flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-brand-pink-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <Send size={15} />
              Subscribe
            </button>
          </form>
          {subscribed && (
            <p className="mt-2 text-xs font-medium text-brand-pink-300">Thanks! You&apos;re on the list 🎀</p>
          )}
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/shop?category=Doll" className="hover:text-brand-pink-300">Dolls</Link></li>
            <li><Link to="/shop?category=Bouquet" className="hover:text-brand-pink-300">Bouquets</Link></li>
            <li><Link to="/shop?category=Gifts" className="hover:text-brand-pink-300">Gifts</Link></li>
            <li><Link to="/shop?category=Combo" className="hover:text-brand-pink-300">Combos</Link></li>
            <li><Link to="/trending" className="hover:text-brand-pink-300">Trending</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="mailto:dollnepal.np@gmail.com" className="flex items-center gap-2 hover:text-brand-pink-300">
                <Mail size={16} /> dollnepal.np@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+9779761302887" className="flex items-center gap-2 hover:text-brand-pink-300">
                <Phone size={16} /> +977-9761302887
              </a>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="#"
              aria-label="DollNepal on Instagram"
              className="rounded-full bg-neutral-900 p-2.5 ring-1 ring-neutral-700 transition-colors hover:text-brand-pink-300"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="#"
              aria-label="DollNepal on TikTok"
              className="rounded-full bg-neutral-900 p-2.5 ring-1 ring-neutral-700 transition-colors hover:text-brand-pink-300"
            >
              <Music2 size={18} />
            </a>
          </div>
          <p className="mt-3 text-xs text-neutral-500">@dollnepal.np on Instagram &amp; TikTok</p>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} DollNepal. All rights reserved.</p>
          <p>Made with 💖 in Nepal</p>
        </div>
      </div>
    </footer>
  );
}
