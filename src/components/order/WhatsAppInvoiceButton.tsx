"use client";

import { MessageCircle } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf/invoice";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import type { Order } from "@/lib/types";

export default function WhatsAppInvoiceButton({ order, orderUrl }: { order: Order; orderUrl: string }) {
  function handleClick() {
    generateInvoicePdf(order);
    window.open(buildOrderWhatsAppLink(order, orderUrl), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-purple-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-purple-700 transition-colors hover:border-brand-purple-400"
    >
      <MessageCircle size={18} />
      Inquire / Order on WhatsApp
    </button>
  );
}
