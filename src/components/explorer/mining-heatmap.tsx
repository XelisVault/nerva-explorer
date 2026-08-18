"use client";

import { useMemo } from "react";
import { type BlockHeader, COIN_CONFIG } from "@/lib/nerva-api";

type Props = {
  blocks: BlockHeader[];
};

type DayData = {
  date: string;
  dateObj: Date;
  blockCount: number;
  avgDifficulty: number;
  avgHashrate: number;
};

export default function MiningHeatmap({ blocks }: Props) {
  const dayData = useMemo(() => {
    if (blocks.length === 0) return [];

    const byDay = new Map<string, { blocks: BlockHeader[]; dateObj: Date }>();

    for (const block of blocks) {
      const d = new Date(block.timestamp * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      if (!byDay.has(dateKey)) {
        byDay.set(dateKey, { blocks: [], dateObj: d });
      }
      byDay.get(dateKey)!.blocks.push(block);
    }

    const result: DayData[] = [];
    for (const [dateKey, { blocks: dayBlocks, dateObj }] of byDay) {
      const avgDiff =
        dayBlocks.reduce((sum, b) => sum + b.difficulty, 0) / dayBlocks.length;
      result.push({
        date: dateKey,
        dateObj,
        blockCount: dayBlocks.length,
        avgDifficulty: avgDiff,
        avgHashrate: avgDiff / COIN_CONFIG.blockTarget,
      });
    }

    return result.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [blocks]);

  if (dayData.length === 0) return null;

  const maxCount = Math.max(...dayData.map((d) => d.blockCount));

  const getIntensity = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return "var(--brand-teal)";
    if (ratio > 0.5) return "color-mix(in srgb, var(--brand-teal) 70%, var(--clr-bg-secondary))";
    if (ratio > 0.25) return "color-mix(in srgb, var(--brand-teal) 40%, var(--clr-bg-secondary))";
    if (ratio > 0) return "color-mix(in srgb, var(--brand-teal) 20%, var(--clr-bg-secondary))";
    return "var(--clr-bg-secondary)";
  };

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "var(--clr-border)",
        background: "var(--clr-bg-surface)",
      }}
    >
      <h3 className="text-sm font-bold mb-3" style={{ color: "var(--clr-text)" }}>
        Mining Activity
      </h3>
      <div className="flex flex-wrap gap-1">
        {dayData.map((day) => (
          <div
            key={day.date}
            className="w-[28px] h-[28px] rounded-sm cursor-pointer transition-transform hover:scale-110"
            style={{ background: getIntensity(day.blockCount) }}
            title={`${day.dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${day.blockCount} blocks, avg diff: ${day.avgDifficulty.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-[9px]" style={{ color: "var(--clr-text-muted)" }}>
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0.15, 0.35, 0.6, 0.85, 1].map((ratio) => (
            <div
              key={ratio}
              className="w-[10px] h-[10px] rounded-sm"
              style={{ background: getIntensity(maxCount * ratio) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
      <div className="mt-2 text-[10px]" style={{ color: "var(--clr-text-subtle)" }}>
        {dayData.length} day{dayData.length !== 1 ? "s" : ""} of data · based on last {blocks.length} blocks
      </div>
    </div>
  );
}
