# DollNepal

Cute Gifts • Dolls • Love — a "minimal premium, playful colors" e-commerce store for
DollNepal, built with **Next.js (App Router) + Tailwind CSS + Firebase**.

Customers browse the catalogue, add items to a cart, check out with their name/phone/
delivery address, and land on a dedicated order page to pay via eSewa or Fonpay (or
confirm on WhatsApp with an auto-generated PDF invoice). Orders can be tracked by
Order ID or phone number, with a modular Nepal Can Move (NCM) integration that falls
back to a mock simulator until real API keys are added. The admin panel manages
products (with direct gallery-to-cloud-storage uploads) and orders.

## Stack

- **Next.js 16** (App Router, Server Actions, Server Components)
- **Tailwind CSS v4** — brand palette extracted from the logo (pink → purple gradient, gold accents)
- **Firebase** — Firestore (products, orders), Storage (product photos), Auth (admin login)
- **jsPDF + jspdf-autotable** — client-side invoice PDF generation
- No traditional payment gateway integration yet — eSewa/Fonpay are shown as QR/ID
  placeholders per the spec, with env vars wired up for when real merchant credentials exist

> ⚠️ This is a Next.js **16.3** project — meaningfully newer than most models' training
> data (Cache Components, `proxy.ts` replacing `middleware.ts`, `params`/`searchParams`
> as Promises, etc). If you're picking this up with an LLM's help, point it at
> `node_modules/next/dist/docs/` first — see `node_modules/next/AGENTS.md`.

## Project structure

```
src/
  app/                    routes (App Router)
    admin/(dashboard)/    products & orders management, session-gated
    admin/login/          admin sign-in (Firebase Auth)
    product/[slug]/       product detail
    order/[orderId]/      order summary + payment (noindex)
    track/                order tracking (Order ID or phone)
    cart/, checkout/       cart + checkout flow
    sitemap.ts, robots.ts  dynamic SEO files
  components/             UI components (storefront, cart, admin, order, track)
  lib/
    firebase/             client.ts (Auth+Storage) / admin.ts (Firestore/Auth/Storage, Admin SDK)
    data/                 server-only Firestore reads (products.ts, orders.ts)
    actions/              Server Actions — all writes go through here (auth.ts, products.ts, orders.ts)
    ncm.ts                Nepal Can Move tracking integration + mock fallback
    pdf/invoice.ts         client-side PDF invoice generator
    whatsapp.ts, currency.ts, orderId.ts, types.ts
  proxy.ts                protects /admin/* (Next 16's renamed middleware.ts)
firebase.json, firestore.rules, storage.rules, .firebaserc   Firebase Emulator Suite config
scripts/seed-emulator.mjs                                     seeds emulator with admin user + dummy products
```

## Running locally (Firebase Emulator Suite — no real project needed)

Everything works out of the box against local emulators; `.env.local` is already
configured for this (`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, `demo-dollnepal` project).

```bash
# Terminal 1 — Firestore/Auth/Storage emulators (keep running)
npm run emulators

# Terminal 2 — seed the admin user + 12 dummy products (run once, or after emulators:start --import wipes data)
npm run seed

# Terminal 3 — the app
npm run dev
```

Then visit `http://localhost:3000`. Admin panel: `http://localhost:3000/admin/login`
— credentials printed by `npm run seed` (default `admin@dollnepal.com.np` /
`DollNepal123!`, from `.env.local`'s `ADMIN_EMAIL` / `ADMIN_SEED_PASSWORD`).

The Emulator UI (Firestore/Auth/Storage data browser) is at `http://localhost:4000`.

## Connecting a real Firebase project

1. Create a Firebase project, enable **Firestore**, **Storage**, and **Authentication**
   (Email/Password provider).
2. Copy `.env.local.example` to `.env.local`, fill in the `NEXT_PUBLIC_FIREBASE_*` keys
   (Project settings → General) and the Admin SDK fields (Project settings → Service
   accounts → Generate new private key). Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`.
3. Create exactly one Firebase Auth user (Email/Password) for yourself and set
   `ADMIN_EMAIL` to that address — that's the only account `/admin` will accept.
4. Deploy the security rules: `npx firebase-tools deploy --only firestore:rules,storage:rules`.
5. Run the seed script's product-seeding logic once against the real project (or just
   add products through `/admin`).

## Environment variables

See `.env.local.example` for the full schema. Payment gateways (`ESEWA_*`,
`FONPAY_*`) and NCM tracking (`NCM_*`) are intentionally blank placeholders — the app
works fully without them:

- **eSewa / Fonpay**: the order page shows QR-code placeholders
  (`public/payment/*.svg`) and ID placeholders (`src/components/order/PaymentTabs.tsx`)
  to swap for your real merchant QR codes and IDs. "I Have Paid" just flips the order
  to `pending_verification` for manual reconciliation — there's no live payment gateway
  call here yet.
- **NCM**: `src/lib/ncm.ts` calls the real NCM status endpoint when
  `NCM_API_KEY`/`NCM_VENDOR_ID`/`NCM_API_URL` are set and the order has an
  `ncmTrackingId` (set by the admin when marking an order dispatched). Otherwise it
  simulates the same 5-step timeline from the order's own `shippingStatus`, which the
  admin panel controls — swap in the real response mapping once NCM's API docs are in hand.

## Security notes (read before going to production)

- **Admin auth**: real Firebase Auth + a signed session cookie
  (`adminAuth.createSessionCookie`), gated by `ADMIN_EMAIL` — only one account can ever
  sign in. `src/proxy.ts` does a fast cookie-presence redirect for UX; the actual
  cryptographic check runs server-side in `requireAdminSession()` on every admin
  Server Action and the dashboard layout. Firestore/Storage rules deny all direct
  client writes — every mutation goes through the Admin SDK in `src/lib/actions/`.
- **"I Have Paid"** (`markPaymentSubmittedAction`) is intentionally public — the
  customer calls it from their own order page. It only flags an order for manual
  verification; it can't mark anything as actually paid. Knowing an Order ID is enough
  to trigger it, which is an acceptable prototype-level tradeoff given the low stakes,
  but worth hardening (e.g. rate limiting) before scale.
- **Storage uploads**: any signed-in Firebase Auth user can upload to `/products/**`
  (see `storage.rules`) — fine since this app has no public sign-up and only the admin
  ever authenticates, but revisit if that assumption changes.
- Order data (name, phone, address) is never client-readable/writable directly —
  see `firestore.rules`.

## What's still a placeholder

- Product photos for seed data are generated on-brand SVGs (`public/products/*.svg`,
  gradient + emoji) — swap for real photography, or just re-upload through `/admin`.
- eSewa/Fonpay QR codes (`public/payment/*.svg`) and IDs (`PaymentTabs.tsx`) are
  placeholders — replace with your real ones.
- TikTok/Instagram footer links are `#` placeholders per the brief.
