"use client";

import { Download } from "lucide-react";
import { generateInvoicePdf } from "@/lib/pdf/invoice";
import type { Order } from "@/lib/types";

export default function DownloadInvoiceButton({ order }: { order: Order }) {
  return (
    <button
      type="button"
      onClick={() => generateInvoicePdf(order)}
      className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full brand-gradient-bg px-8 py-4 text-base font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
    >
      <Download size={20} />
      Download Invoice / Bill
    </button>
  );
}
