"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { type BlockHeader, formatBlockTime, formatBlockSize, decimalUnits } from "@/lib/nerva-api";
import { CubeIcon } from "./icons";

type Props = {
  blocks: BlockHeader[];
  loading: boolean;
  onSelectBlock: (block: BlockHeader) => void;
};

export default function BlocksTable({ blocks, loading, onSelectBlock }: Props) {
  const [filter, setFilter] = useState<"all" | "tx">("all");

  const filtered = filter === "tx" ? blocks.filter((b) => b.num_txes > 0) : blocks;

  return (
    <section id="blocks" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight" style={{ color: "var(--clr-text)" }}>
              <CubeIcon className="h-6 w-6" style={{ color: "var(--clr-accent)" }} />
              Recent <span className="gradient-text">Blocks</span>
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--clr-text-muted)" }}>
              Latest {blocks.length} blocks mined on the Nerva network
            </p>
          </div>
          <div className="flex gap-1 rounded-full p-1" style={{ background: "var(--clr-bg-secondary)" }}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === "all" ? "text-white" : ""
              }`}
              style={{
                background: filter === "all" ? "var(--clr-accent)" : "transparent",
                color: filter === "all" ? "#ffffff" : "var(--clr-text-muted)",
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("tx")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors`}
              style={{
                background: filter === "tx" ? "var(--clr-accent)" : "transparent",
                color: filter === "tx" ? "#ffffff" : "var(--clr-text-muted)",
              }}
            >
              With TXs
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: "var(--clr-border)",
            background: "var(--clr-bg-surface)",
          }}
        >
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--clr-bg-secondary)" }}>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Height</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Hash</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Size</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>TXs</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>Reward</th>
                </tr>
              </thead>
              <tbody>
                {loading && blocks.length === 0
                  ? [...Array(15)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="h-14 shimmer" />
                      </tr>
                    ))
                  : filtered.slice(0, 50).map((block, i) => {
                      const time = formatBlockTime(block.timestamp);
                      return (
                        <motion.tr
                          key={block.hash}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.02, 0.4) }}
                          className="tx-row border-t"
                          style={{ borderColor: "var(--clr-border-light)" }}
                          onClick={() => onSelectBlock(block)}
                        >
                          <td className="px-4 py-3">
                            <span className="font-bold" style={{ color: "var(--clr-accent)" }}>
                              {block.height.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <div style={{ color: "var(--clr-text)" }}>{time.abs}</div>
                            <div className="text-xs" style={{ color: "var(--clr-text-muted)" }}>{time.ago}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="hash hash-truncate" style={{ color: "var(--clr-text-muted)", maxWidth: 280 }}>
                              {block.hash}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm" style={{ color: "var(--clr-text)" }}>
                            {formatBlockSize(block.block_size)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {block.num_txes > 0 ? (
                              <span className="badge badge-info">{block.num_txes}</span>
                            ) : (
                              <span style={{ color: "var(--clr-text-subtle)" }}>0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: "var(--clr-text)" }}>
                            {decimalUnits(block.reward).toFixed(4)}
                          </td>
                        </motion.tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y" style={{ borderColor: "var(--clr-border-light)" }}>
            {filtered.slice(0, 30).map((block) => {
              const time = formatBlockTime(block.timestamp);
              return (
                <button
                  key={block.hash}
                  onClick={() => onSelectBlock(block)}
                  className="block w-full p-4 text-left transition-colors hover:bg-[var(--clr-bg-hover)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: "var(--clr-accent)" }}>
                      #{block.height.toLocaleString()}
                    </span>
                    <span className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                      {time.ago}
                    </span>
                  </div>
                  <div className="mt-1 hash hash-truncate text-xs" style={{ color: "var(--clr-text-muted)" }}>
                    {block.hash}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span style={{ color: "var(--clr-text-muted)" }}>
                      Size: {formatBlockSize(block.block_size)} · TXs: {block.num_txes}
                    </span>
                    <span className="font-semibold" style={{ color: "var(--clr-text)" }}>
                      {decimalUnits(block.reward).toFixed(4)} XNV
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--clr-text-muted)" }}>
            No blocks found
          </div>
        )}
      </div>
    </section>
  );
}
