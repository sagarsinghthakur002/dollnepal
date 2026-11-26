"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, PackageSearch, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function AccountMenu({ transparent }: { transparent: boolean }) {
  const { user, loading, openSignIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const base = `inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
    transparent ? "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm" : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
  }`;

  if (loading) return <span className={`${base} w-11 animate-pulse`} aria-hidden />;

  if (!user) {
    return (
      <button type="button" onClick={() => openSignIn()} className={`${base} gap-1.5 px-3.5 sm:px-4`}>
        <UserIcon size={16} />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const initial = (user.displayName || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/80 shadow-soft"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center brand-gradient-bg text-base font-bold text-white">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/10">
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-neutral-900">{user.displayName || "My account"}</p>
            {user.email && <p className="truncate text-xs text-neutral-500">{user.email}</p>}
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-2.5 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-brand-cream-100"
          >
            <PackageSearch size={16} /> My orders &amp; history
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex min-h-12 w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
