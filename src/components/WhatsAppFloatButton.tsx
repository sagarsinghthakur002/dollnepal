"use client";

import { MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={buildGeneralWhatsAppLink("Hello DollNepal! I have a question.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with DollNepal on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-110"
    >
      <MessageCircle size={26} className="fill-white" />
    </a>
  );
}
