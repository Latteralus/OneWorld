import type { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-lg border border-neutral-800 bg-neutral-900 p-4 ${className}`}>
      {children}
    </div>
  );
}
