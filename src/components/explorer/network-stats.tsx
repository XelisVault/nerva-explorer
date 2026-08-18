"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CubeIcon,
  HashrateIcon,
  ClockIcon,
  CoinsIcon,
  NetworkIcon,
  DatabaseIcon,
  ZapIcon,
  ExchangeIcon,
} from "./icons";
import {
  type NetworkInfo,
  type BlockHeader,
  displayUnits,
  formatHashrate,
  decimalUnits,
  averageSolveTime,
  COIN_CONFIG,
} from "@/lib/nerva-api";
import BlockClock from "./block-clock";
import SyncProgress from "./sync-progress";

type Props = {
  networkInfo: NetworkInfo | null;
  blocks: BlockHeader[];
  generatedCoins: number;
  loading: boolean;
};

export default function NetworkStats({ networkInfo, blocks, generatedCoins, loading }: Props) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading && !networkInfo) {
    return (
      <section id="network" className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl shimmer"
                style={{ background: "var(--clr-bg-surface)" }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!networkInfo) return null;

  const hashrate = formatHashrate(networkInfo.difficulty);
  const solveTime = averageSolveTime(blocks);
  const circulating = generatedCoins;
  const lastBlock = blocks[0];
  const lastReward = lastBlock ? decimalUnits(lastBlock.reward) : 0;
  const lastBlockAgo = lastBlock ? now - lastBlock.timestamp : 0;

  const stats = [
    {
      label: "Height",
      value: networkInfo.height.toLocaleString(),
      icon: CubeIcon,
      color: "var(--brand-teal)",
      sub: lastBlockAgo > 0 ? (lastBlockAgo < 120 ? `${lastBlockAgo}s ago` : `${Math.floor(lastBlockAgo / 60)}m ago`) : "",
    },
    {
      label: "Hashrate",
      value: hashrate,
      icon: HashrateIcon,
      color: "#10b981",
      sub: `Diff ${displayUnits(networkInfo.difficulty, 2)}`,
    },
    {
      label: "Avg Solve",
      value: solveTime ? `${solveTime.toFixed(1)}s` : "—",
      icon: ClockIcon,
      color: "var(--brand-indigo)",
      sub: `Target ${networkInfo.target}s`,
    },
    {
      label: "TX Count",
      value: networkInfo.tx_count.toLocaleString(),
      icon: ExchangeIcon,
      color: "#f59e0b",
      sub: `Pool ${networkInfo.tx_pool_size}`,
    },
    {
      label: "Supply",
      value: circulating > 0 ? circulating.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—",
      unit: "XNV",
      icon: CoinsIcon,
      color: "var(--brand-purple)",
      sub: "Tail emission",
    },
    {
      label: "Reward",
      value: lastReward.toFixed(4),
      unit: "XNV",
      icon: ZapIcon,
      color: "#10b981",
      sub: "Per block",
    },
    {
      label: "Network",
      value: networkInfo.nettype.toUpperCase(),
      icon: NetworkIcon,
      color: "#06b6d4",
      sub: `v${lastBlock?.major_version || "?"}.${lastBlock?.minor_version || "?"}`,
    },
    {
      label: "DB Size",
      value: displayUnits(networkInfo.database_size, 2) + "B",
      icon: DatabaseIcon,
      color: "#ec4899",
      sub: "On disk",
    },
  ];

  return (
    <section id="network" className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row: Block clock + sync progress */}
        <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl border p-4"
          style={{
            borderColor: "var(--clr-border)",
            background: "var(--clr-bg-surface)",
          }}
        >
          <BlockClock
            lastBlockTimestamp={lastBlock ? lastBlock.timestamp : null}
            blockTarget={COIN_CONFIG.blockTarget}
          />
          <div className="hidden sm:block h-12 w-px" style={{ background: "var(--clr-border)" }} />
          <div className="flex-1 min-w-[200px]">
            <SyncProgress
              height={networkInfo.height}
              targetHeight={networkInfo.target_height}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-xl border p-3.5 transition-colors hover:border-[var(--clr-accent)]"
                style={{
                  borderColor: "var(--clr-border-light)",
                  background: "var(--clr-bg-surface)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className="h-4 w-4"
                    style={{ color: stat.color }}
                  />
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold" style={{ color: "var(--clr-text)" }}>
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-[10px] font-medium" style={{ color: "var(--clr-text-muted)" }}>
                      {stat.unit}
                    </span>
                  )}
                </div>
                {stat.sub && (
                  <div className="mt-0.5 text-[10px]" style={{ color: "var(--clr-text-subtle)" }}>
                    {stat.sub}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
