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
} from "@/lib/nerva-api";

type Props = {
  networkInfo: NetworkInfo | null;
  blocks: BlockHeader[];
  generatedCoins: number;
  loading: boolean;
};

export default function NetworkStats({ networkInfo, blocks, generatedCoins, loading }: Props) {
  // `now` is the wall-clock second used for "Xs ago" labels. It's seeded via
  // useEffect (not in the useState initializer) to keep render pure.
  const [now, setNow] = useState(0);

  useEffect(() => {
    const update = () => setNow(Math.floor(Date.now() / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  if (loading && !networkInfo) {
    return (
      <section id="network" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl shimmer"
                style={{ background: "var(--clr-bg-surface)" }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!networkInfo) return null;

  // Calculate stats
  // Note: getGeneratedCoins API returns XNV directly (not atomic units), unlike block rewards
  const hashrate = formatHashrate(networkInfo.difficulty);
  const solveTime = averageSolveTime(blocks);
  const circulating = generatedCoins; // Already in XNV
  const lastBlock = blocks[0];
  const lastReward = lastBlock ? decimalUnits(lastBlock.reward) : 0;
  const lastBlockAgo = lastBlock ? now - lastBlock.timestamp : 0;

  const stats = [
    {
      label: "Network Height",
      value: networkInfo.height.toLocaleString(),
      icon: CubeIcon,
      color: "var(--brand-teal)",
      sub: lastBlockAgo < 120 ? `${lastBlockAgo}s ago` : `${Math.floor(lastBlockAgo / 60)}m ago`,
      pulse: lastBlockAgo < 90,
    },
    {
      label: "Hashrate",
      value: hashrate,
      icon: HashrateIcon,
      color: "var(--brand-green)",
      sub: `Diff: ${displayUnits(networkInfo.difficulty, 2)}`,
    },
    {
      label: "Avg. Solve Time",
      value: solveTime ? `${solveTime.toFixed(2)}s` : "—",
      icon: ClockIcon,
      color: "var(--brand-indigo)",
      sub: `Target: ${networkInfo.target}s`,
    },
    {
      label: "Transactions",
      value: networkInfo.tx_count.toLocaleString(),
      icon: ExchangeIcon,
      color: "#f59e0b",
      sub: `Pool: ${networkInfo.tx_pool_size}`,
    },
    {
      label: "Circulating Supply",
      value: `${circulating.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      unit: "XNV",
      icon: CoinsIcon,
      color: "var(--brand-purple)",
      sub: "Tail emission active",
    },
    {
      label: "Block Reward",
      value: lastReward.toFixed(4),
      unit: "XNV",
      icon: ZapIcon,
      color: "#10b981",
      sub: "Per block",
    },
    {
      label: "Network Type",
      value: networkInfo.nettype.toUpperCase(),
      icon: NetworkIcon,
      color: "#06b6d4",
      sub: `v${lastBlock?.major_version || "?"}.${lastBlock?.minor_version || "?"}`,
    },
    {
      label: "Database Size",
      value: displayUnits(networkInfo.database_size, 2) + "B",
      icon: DatabaseIcon,
      color: "#ec4899",
      sub: "On disk",
    },
  ];

  return (
    <section id="network" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--clr-text)" }}>
              Network <span className="gradient-text">Stats</span>
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--clr-text-muted)" }}>
              Live blockchain data, auto-refreshed every 15 seconds
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "var(--clr-text-muted)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="stat-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                      color: stat.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {stat.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
                  {stat.label}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold" style={{ color: "var(--clr-text)" }}>
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-xs font-semibold" style={{ color: "var(--clr-text-muted)" }}>
                      {stat.unit}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--clr-text-subtle)" }}>
                  {stat.sub}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
