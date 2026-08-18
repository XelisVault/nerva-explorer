"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type TxPoolEntry, decimalUnits } from "@/lib/nerva-api";

type Props = {
  txPool: TxPoolEntry[];
  onSelectTx: (hash: string) => void;
};

export default function MempoolVisualization({ txPool, onSelectTx }: Props) {
  const sorted = txPool
    .map((tx) => ({
      ...tx,
      feeRate: tx.weight > 0 ? (decimalUnits(tx.fee) * 1024) / tx.weight : 0,
    }))
    .sort((a, b) => b.feeRate - a.feeRate);

  const totalWeight = sorted.reduce((sum, tx) => sum + (tx.weight || 0), 0);
  const blockSizeLimit = 300000;

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center" style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}>
        <p className="text-xs" style={{ color: "var(--clr-text-subtle)" }}>
          Mempool is empty
        </p>
      </div>
    );
  }

  let cumulativeWeight = 0;

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--clr-border)", background: "var(--clr-bg-surface)" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--clr-border)" }}>
        <span className="text-xs font-medium" style={{ color: "var(--clr-text)" }}>
          Mempool · {sorted.length} tx
        </span>
        <span className="text-[10px] font-mono" style={{ color: "var(--clr-text-subtle)" }}>
          {totalWeight.toLocaleString()} bytes
        </span>
      </div>

      <div className="p-2 max-h-[200px] overflow-y-auto space-y-0.5">
        <AnimatePresence initial={false}>
          {sorted.map((tx, i) => {
            cumulativeWeight += tx.weight || 0;
            const inNextBlock = cumulativeWeight <= blockSizeLimit;
            return (
              <motion.button
                key={tx.id_hash}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectTx(tx.id_hash)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] hover:bg-[var(--clr-bg-hover)] transition-colors cursor-pointer"
                style={{ borderLeft: inNextBlock ? "2px solid var(--clr-accent)" : "2px solid transparent" }}
                title={`Fee: ${decimalUnits(tx.fee).toFixed(6)} XNV · ${tx.weight} bytes`}
              >
                <span className="hash flex-shrink-0" style={{ color: "var(--clr-text-muted)" }}>
                  {tx.id_hash.slice(0, 10)}...
                </span>
                <div className="flex-1" />
                <span className="font-mono" style={{ color: "var(--clr-text-subtle)" }}>
                  {tx.weight || 0} B
                </span>
                <span className="font-mono font-medium" style={{ color: inNextBlock ? "var(--clr-accent)" : "var(--clr-text-muted)" }}>
                  {tx.feeRate.toFixed(4)}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
