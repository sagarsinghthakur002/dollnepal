import { Check, Circle, Radio } from "lucide-react";
import type { TrackingStep } from "@/lib/types";

export default function TrackingTimeline({ steps, isLive, courierName = "Nepal Can Move" }: { steps: TrackingStep[]; isLive: boolean; courierName?: string }) {
  return (
    <div>
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
        <Radio size={12} className={isLive ? "text-emerald-500" : "text-neutral-400"} />
        {isLive ? `Live status from ${courierName}` : "Status updated by DollNepal — use the courier link above for the latest scans"}
      </p>

      <ol className="space-y-0">
        {steps.map((step, i) => (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${
                  step.done ? "bg-brand-pink-400" : "bg-neutral-200"
                }`}
              />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                step.done ? "brand-gradient-bg text-white" : "bg-neutral-100 text-neutral-400"
              } ${step.current ? "ring-4 ring-brand-pink-100" : ""}`}
            >
              {step.done ? <Check size={16} /> : <Circle size={10} />}
            </span>
            <div className="pt-0.5">
              <p className={`font-display text-sm font-semibold ${step.done ? "text-neutral-900" : "text-neutral-400"}`}>
                {step.label}
              </p>
              <p className={`text-xs ${step.done ? "text-neutral-500" : "text-neutral-400"}`}>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
