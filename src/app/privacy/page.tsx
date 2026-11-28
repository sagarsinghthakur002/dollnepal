import type { Metadata } from "next";
import { SITE_INFO } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DollNepal collects, uses and protects your personal information.",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-xs text-neutral-400">Last updated: November 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-600 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <section>
          <h2>What we collect</h2>
          <ul>
            <li>Your name, phone number and delivery address, so we can deliver your order.</li>
            <li>Your order details, payment method and the payment screenshot you upload, so we can confirm your payment.</li>
            <li>If you sign in with Google: your name, email address and profile picture, to show your order history.</li>
          </ul>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>We use your information only to process and deliver your order, confirm payments, contact you about your order and show your order history. We share your name, phone number and address with the courier (Nepal Can Move or Upaya Services) only so they can deliver your parcel.</p>
        </section>
        <section>
          <h2>What we don&apos;t do</h2>
          <p>We don&apos;t sell your information. We don&apos;t share it with anyone else except the couriers and the service providers that run this website (hosting, database and email).</p>
        </section>
        <section>
          <h2>Cookies and storage</h2>
          <p>We store your cart on your device so it is still there when you come back, and a secure cookie if you sign in. We don&apos;t use advertising cookies.</p>
        </section>
        <section>
          <h2>Your choices</h2>
          <p>To ask us to delete your details, message us on WhatsApp or email us with your Order ID.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>Questions? Email dollnepal.np@gmail.com or message us on WhatsApp. {SITE_INFO.location}.</p>
        </section>
      </div>
    </main>
  );
}
