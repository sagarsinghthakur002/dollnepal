"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Trending", href: "/trending" },
  { label: "Track Order", href: "/track" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-pink-100 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/logo.jpg"
            alt="DollNepal logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-gold-300"
          />
          <span className="font-display text-xl font-semibold tracking-tight">
            <span className="brand-gradient-text">DollNepal</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === link.href ? "text-brand-pink-600" : "text-neutral-600 hover:text-brand-pink-500"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-full brand-gradient-bg px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-105"
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
            className="inline-flex items-center justify-center rounded-full p-2 text-brand-pink-600 lg:hidden"
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
                  className={`block rounded-xl px-3 py-2.5 text-base font-semibold ${
                    pathname === link.href ? "bg-brand-pink-50 text-brand-pink-600" : "text-neutral-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
