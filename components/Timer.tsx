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
          <circle cx="32" cy="32" r="28" fill="none" stroke="#374151" strokeWidth="5" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white text-xl">
          {formatTime(elapsedTime)}
        </div>
      </div>
      <span className="text-gray-400 text-xs">経過</span>
    </div>
  );
}
