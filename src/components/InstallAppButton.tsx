"use client";

import { Download } from "lucide-react";
import { INSTALL_EVENT } from "@/components/PwaRegister";

/** "Install app" link — opens the native install prompt where supported, otherwise step-by-step instructions. */
export default function InstallAppButton({ className = "", label = "Install app" }: { className?: string; label?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(INSTALL_EVENT))} className={className}>
      <Download size={14} className="mr-1.5 inline -mt-0.5" />
      {label}
    </button>
  );
}
