"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  lastBlockTimestamp: number | null;
  blockTarget: number;
};

export default function BlockClock({ lastBlockTimestamp, blockTarget }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!lastBlockTimestamp) return;
    const update = () => {
      setElapsed(Math.floor(Date.now() / 1000) - lastBlockTimestamp);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastBlockTimestamp]);

  if (!lastBlockTimestamp) return null;

  const progress = Math.min(elapsed / blockTarget, 1.2);
  const isOverdue = elapsed > blockTarget;
  const isWarning = elapsed > blockTarget * 1.5;

  const color = isWarning ? "#ef4444" : isOverdue ? "#f59e0b" : "#10b981";
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-[72px] h-[72px] flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--clr-border)"
            strokeWidth="4"
          />
          <motion.circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset, stroke: color }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color: "var(--clr-text)" }}>
            {elapsed}s
          </span>
          <span className="text-[8px] uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
            {isOverdue ? "overdue" : "ago"}
          </span>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
          Last Block
        </div>
        <div className="text-sm" style={{ color: "var(--clr-text)" }}>
          Target: {blockTarget}s
        </div>
        <div className="text-[10px] mt-0.5" style={{ color }}>
          {isWarning ? "Significantly overdue" : isOverdue ? "Slightly overdue" : "On schedule"}
        </div>
      </div>
    </div>
  );
}
