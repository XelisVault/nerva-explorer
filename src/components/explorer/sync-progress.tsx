"use client";

import { motion } from "framer-motion";

type Props = {
  height: number;
  targetHeight: number;
};

export default function SyncProgress({ height, targetHeight }: Props) {
  if (targetHeight === 0 || height >= targetHeight) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{
          borderColor: "color-mix(in srgb, #10b981 30%, var(--clr-border))",
          background: "color-mix(in srgb, #10b981 8%, var(--clr-bg-surface))",
        }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#10b981">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
        </svg>
        <span className="text-xs font-semibold" style={{ color: "#10b981" }}>
          Synced
        </span>
      </div>
    );
  }

  const pct = Math.min((height / targetHeight) * 100, 100);
  const remaining = targetHeight - height;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
          Synchronizing
        </span>
        <span className="text-[10px]" style={{ color: "var(--clr-text-muted)" }}>
          {remaining.toLocaleString()} blocks remaining
        </span>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: "var(--clr-bg-secondary)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--brand-teal), var(--brand-purple))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div
          className="absolute inset-0 shimmer"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", backgroundSize: "200% 100%" }}
        />
      </div>
      <div className="mt-1 text-right">
        <span className="text-[10px] font-semibold" style={{ color: "var(--clr-accent)" }}>
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
