import type { Metadata } from "next";
import AccountOrders from "@/components/account/AccountOrders";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <AccountOrders />
    </main>
  );
}
