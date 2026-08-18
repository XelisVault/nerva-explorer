"use client";

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

  const progress = Math.min(elapsed / blockTarget, 1);
  const isOverdue = elapsed > blockTarget;

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="var(--clr-border)"
            strokeWidth="2.5"
          />
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke={isOverdue ? "#f59e0b" : "var(--clr-accent)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.3s" }}
          />
        </svg>
      </div>
      <div>
        <div className="text-sm font-mono font-medium" style={{ color: "var(--clr-text)" }}>
          {elapsed}s
        </div>
        <div className="text-[10px]" style={{ color: "var(--clr-text-subtle)" }}>
          since last block
        </div>
      </div>
    </div>
  );
}
