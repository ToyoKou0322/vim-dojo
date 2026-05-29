"use client";

import { useEffect, useRef } from "react";

interface TimerProps {
  elapsedTime: number;
  isRunning: boolean;
  onTick: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : String(s);
}

export default function Timer({ elapsedTime, isRunning, onTick }: TimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(onTick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTick]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a44" strokeWidth="4" />
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="4"
            strokeDasharray="175.9"
            strokeDashoffset={isRunning ? "0" : "44"}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl neon-cyan">
          {formatTime(elapsedTime)}
        </div>
      </div>
      <span className="text-xs font-mono" style={{ color: "var(--dim)" }}>経過</span>
    </div>
  );
}
