"use client";

import { Difficulty, DIFFICULTIES, CHALLENGES } from "@/lib/challenges";

type Filter = Difficulty | "all";

interface DifficultySelectorProps {
  selected: Filter;
  onChange: (d: Filter) => void;
  completedIds: Set<string>;
}

const ACTIVE_STYLE: Record<string, string> = {
  all:          "btn-neon-cyan",
  beginner:     "border border-[#39ff14] text-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.3)] bg-[rgba(57,255,20,0.05)]",
  intermediate: "border border-[#ffdd00] text-[#ffdd00] shadow-[0_0_8px_rgba(255,221,0,0.3)] bg-[rgba(255,221,0,0.05)]",
  advanced:     "btn-neon-pink",
};

export default function DifficultySelector({ selected, onChange, completedIds }: DifficultySelectorProps) {
  const filters: Filter[] = ["all", "beginner", "intermediate", "advanced"];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((d) => {
        const info = d === "all" ? { label: "すべて", icon: "◈" } : DIFFICULTIES[d];
        const total = d === "all" ? CHALLENGES.length : CHALLENGES.filter((c) => c.difficulty === d).length;
        const completed = d === "all"
          ? completedIds.size
          : CHALLENGES.filter((c) => c.difficulty === d && completedIds.has(c.id)).length;
        const isActive = selected === d;

        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-semibold font-mono transition-all ${
              isActive ? ACTIVE_STYLE[d] : "btn-ghost"
            }`}
          >
            <span>{info.icon}</span>
            <span>{info.label}</span>
            <span className="text-xs ml-1 opacity-60">{completed}/{total}</span>
          </button>
        );
      })}
    </div>
  );
}
