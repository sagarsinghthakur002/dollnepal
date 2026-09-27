import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { CartProvider } from "@/components/cart/CartContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DollNepal – Cute Gifts, Dolls & Bouquets in Nepal | Same-Day Delivery",
    template: "%s | DollNepal",
  },
  description:
    "DollNepal brings joy with premium dolls, gift bouquets, combo hampers and cute gifts — delivered across Nepal (Kathmandu, Pokhara & beyond) via Nepal Can Move, and shipped to the Nepali diaspora abroad.",
  keywords: [
    "gift delivery in Nepal",
    "send dolls to Nepal",
    "Nepal birthday gifts",
    "gift bouquet Kathmandu",
    "online gift shop Nepal",
    "DollNepal",
    "combo hamper Nepal",
    "Nepali gift delivery abroad",
  ],
  openGraph: {
    type: "website",
    siteName: "DollNepal",
    title: "DollNepal – Cute Gifts, Dolls & Bouquets in Nepal",
    description:
      "Premium dolls, gift bouquets, combo hampers and cute gifts — delivering joy across Nepal and to the Nepali diaspora.",
    images: ["/logo.jpg"],
    locale: "en_NP",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "DollNepal – Cute Gifts, Dolls & Bouquets in Nepal",
    description: "Premium dolls, gift bouquets, combo hampers and cute gifts — order online, delivered across Nepal.",
    images: ["/logo.jpg"],
  },
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DollNepal",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    description: "Premium dolls, gift bouquets, combo hampers and cute gifts in Nepal.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+977-9761302887",
      contactType: "customer service",
      email: "dollnepal.np@gmail.com",
    },
  };

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <WhatsAppFloatButton />
        </CartProvider>
      </body>
    </html>
  );
}
