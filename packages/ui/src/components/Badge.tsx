import type { PropsWithChildren } from "react";

export type BadgeTone = "neutral" | "positive" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-neutral-800 text-neutral-200",
  positive: "bg-emerald-900 text-emerald-200",
  warning: "bg-amber-900 text-amber-200",
  danger: "bg-red-900 text-red-200",
};

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: BadgeTone }>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
