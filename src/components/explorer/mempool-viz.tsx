"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type TxPoolEntry, decimalUnits } from "@/lib/nerva-api";

type Props = {
  txPool: TxPoolEntry[];
  onSelectTx: (hash: string) => void;
};

type PoolEntry = TxPoolEntry & {
  feeRate: number; // XNV per kB
};

export default function MempoolVisualization({ txPool, onSelectTx }: Props) {
  // Sort by fee rate descending (highest priority first)
  const sorted: PoolEntry[] = txPool
    .map((tx) => ({
      ...tx,
      feeRate: tx.weight > 0 ? (decimalUnits(tx.fee) * 1024) / tx.weight : 0,
    }))
    .sort((a, b) => b.feeRate - a.feeRate);

  const maxFeeRate = sorted.length > 0 ? sorted[0].feeRate : 1;
  const totalWeight = sorted.reduce((sum, tx) => sum + (tx.weight || 0), 0);
  const blockSizeLimit = 300000; // CRYPTONOTE_BLOCK_GRANTED_FULL_REWARD_ZONE

  if (sorted.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{
          borderColor: "var(--clr-border)",
          background: "var(--clr-bg-surface)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--clr-text-muted)" }}>
          Mempool is empty — no pending transactions.
        </p>
      </div>
    );
  }

  // Determine which txs would be in the next block
  let cumulativeWeight = 0;
  const entries = sorted.map((tx) => {
    cumulativeWeight += tx.weight;
    const inNextBlock = cumulativeWeight <= blockSizeLimit;
    return { ...tx, inNextBlock };
  });

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: "var(--clr-border)",
        background: "var(--clr-bg-surface)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--clr-border-light)" }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--clr-text)" }}>
            Mempool ({sorted.length} tx, {totalWeight.toLocaleString()} bytes)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1" style={{ color: "var(--clr-text-muted)" }}>
            <span className="h-2 w-2 rounded-sm" style={{ background: "var(--brand-teal)" }} />
            Next block
          </span>
          <span className="flex items-center gap-1" style={{ color: "var(--clr-text-muted)" }}>
            <span className="h-2 w-2 rounded-sm" style={{ background: "var(--clr-border)" }} />
            Queued
          </span>
        </div>
      </div>

      <div className="p-3 max-h-[280px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {entries.map((tx, i) => {
            const intensity = tx.feeRate / maxFeeRate;
            const bgColor = tx.inNextBlock
              ? `color-mix(in srgb, var(--brand-teal) ${10 + intensity * 30}%, var(--clr-bg-surface))`
              : "var(--clr-bg-secondary)";
            const widthPct = Math.max(20, Math.min(100, (tx.weight / 30000) * 100 + 20));

            return (
              <motion.button
                key={tx.id_hash}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.3) }}
                onClick={() => onSelectTx(tx.id_hash)}
                className="w-full mb-1 group"
                title={`Fee: ${decimalUnits(tx.fee).toFixed(6)} XNV | Rate: ${tx.feeRate.toFixed(6)} XNV/kB | Weight: ${tx.weight}`}
              >
                <div
                  className="flex items-center gap-2 rounded-md px-3 py-1.5 transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    background: bgColor,
                    width: `${widthPct}%`,
                    minWidth: "120px",
                  }}
                >
                  <span className="hash text-[10px] flex-shrink-0" style={{ color: "var(--clr-text-muted)" }}>
                    {tx.id_hash.slice(0, 8)}...
                  </span>
                  <div className="flex-1 flex items-center justify-end gap-3 text-[10px]">
                    <span style={{ color: "var(--clr-text-muted)" }}>{tx.weight} B</span>
                    <span className="font-semibold" style={{ color: tx.inNextBlock ? "var(--brand-teal)" : "var(--clr-text)" }}>
                      {tx.feeRate.toFixed(4)} XNV/kB
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {totalWeight > blockSizeLimit && (
        <div className="px-4 py-2 border-t text-[10px] text-center" style={{ borderColor: "var(--clr-border-light)", color: "var(--clr-text-muted)" }}>
          {totalWeight - blockSizeLimit > 0 && `${(totalWeight - blockSizeLimit).toLocaleString()} bytes queued beyond next block`}
        </div>
      )}
    </div>
  );
}
