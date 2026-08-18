"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type BlockHeader, formatBlockTime, decimalUnits } from "@/lib/nerva-api";

type Props = {
  blocks: BlockHeader[];
  onSelectBlock: (block: BlockHeader) => void;
};

export default function BlockFlow({ blocks, onSelectBlock }: Props) {
  const visibleBlocks = blocks.slice(0, 14);

  return (
    <div className="border-b" style={{ borderColor: "var(--clr-border)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-shrink-0 pr-3 border-r" style={{ borderColor: "var(--clr-border)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--clr-text-muted)" }}>
              Live
            </span>
          </div>

          <div className="flex gap-2 overflow-hidden flex-1">
            <AnimatePresence initial={false}>
              {visibleBlocks.map((block) => {
                const time = formatBlockTime(block.timestamp);
                const hasTxs = block.num_txes > 0;
                return (
                  <motion.button
                    key={block.hash}
                    layout
                    initial={{ x: 60, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: -60, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={() => onSelectBlock(block)}
                    className="flex-shrink-0 w-[88px] group"
                    title={`Block #${block.height} — ${time.abs} (${time.ago})`}
                  >
                    <div
                      className="rounded-lg border px-2 py-1.5 transition-all hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: hasTxs ? "var(--brand-teal)" : "var(--clr-border)",
                        background: hasTxs
                          ? "color-mix(in srgb, var(--brand-teal) 8%, var(--clr-bg-surface))"
                          : "var(--clr-bg-surface)",
                      }}
                    >
                      <div className="text-xs font-bold leading-tight" style={{ color: "var(--clr-accent)" }}>
                        {block.height.toLocaleString()}
                      </div>
                      <div className="text-[9px] mt-0.5" style={{ color: "var(--clr-text-muted)" }}>
                        {time.ago}
                      </div>
                      {hasTxs && (
                        <div className="text-[9px] font-semibold mt-0.5" style={{ color: "var(--brand-teal)" }}>
                          {block.num_txes} tx
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
