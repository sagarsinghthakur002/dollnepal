"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import InstallAppButton from "@/components/InstallAppButton";
import AccountMenu from "@/components/auth/AccountMenu";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Trending", href: "/trending" },
  { label: "Track Order", href: "/track" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync initial state with the current scroll position
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the home page the bar floats transparently over the hero banner until the page is scrolled.
  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`z-50 w-full transition-all duration-300 ${
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      } ${
        transparent
          ? "border-b border-transparent bg-gradient-to-b from-black/40 to-transparent"
          : "border-b border-brand-pink-100 bg-white/90 shadow-sm backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/logo.jpg"
            alt="DollNepal logo"
            width={44}
            height={44}
            className={`h-11 w-11 rounded-full object-cover ring-2 transition-colors ${
              transparent ? "ring-white/80" : "ring-brand-gold-300"
            }`}
          />
          <span className="font-display text-xl font-semibold tracking-tight">
            {transparent ? (
              <span className="text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">DollNepal</span>
            ) : (
              <span className="brand-gradient-text">DollNepal</span>
            )}
          </span>
        </Link>

        <ul
          className={`hidden items-center gap-1 rounded-full p-1 transition-colors lg:flex ${
            transparent ? "bg-white/10 ring-1 ring-white/25 backdrop-blur-sm" : "bg-brand-cream-100 ring-1 ring-black/5"
          }`}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-white text-brand-pink-600 shadow-sm"
                      : transparent
                        ? "text-white/90 hover:bg-white/15 hover:text-white"
                        : "text-neutral-600 hover:bg-white hover:text-brand-pink-500"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <AccountMenu transparent={transparent} />
          <Link
            href="/cart"
            className={`relative inline-flex min-h-11 items-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105 ${
              transparent ? "ring-2 ring-white/50" : ""
            }`}
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold-400 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${
              transparent ? "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm" : "text-brand-pink-600"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-brand-pink-100 bg-white lg:hidden">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-3 text-base font-semibold ${
                    pathname === link.href ? "bg-brand-pink-50 text-brand-pink-600" : "text-neutral-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <InstallAppButton
                label="Install DollNepal app"
                className="block w-full rounded-xl px-3 py-3 text-left text-base font-semibold text-brand-purple-600"
              />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
