"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Lock } from "lucide-react";
import { clientAuth } from "@/lib/firebase/client";
import { signInAdminAction } from "@/lib/actions/auth";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const result = await signInAdminAction(idToken);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(searchParams.get("from") || "/admin");
      router.refresh();
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft ring-1 ring-black/5">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient-bg text-white">
        <Lock size={22} />
      </div>
      <h1 className="mt-4 text-center font-display text-xl font-semibold text-neutral-900">
        DollNepal Admin
      </h1>
      <p className="mt-1 text-center text-sm text-neutral-500">Sign in to manage your store.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <div>
          <label htmlFor="admin-email" className="sr-only">Email</label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@dollnepal.com.np"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="sr-only">Password</label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-pink-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
