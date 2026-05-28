"use client";

import { Difficulty, DIFFICULTIES, CHALLENGES } from "@/lib/challenges";

type Filter = Difficulty | "all";

interface DifficultySelectorProps {
  selected: Filter;
  onChange: (d: Filter) => void;
  completedIds: Set<string>;
}

const ACTIVE: Record<string, string> = {
  all: "bg-white text-gray-900",
  beginner: "bg-green-600 text-white",
  intermediate: "bg-yellow-500 text-gray-900",
  advanced: "bg-red-600 text-white",
};

const IDLE: Record<string, string> = {
  all: "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white",
  beginner: "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white",
  intermediate: "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white",
  advanced: "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white",
};

export default function DifficultySelector({ selected, onChange, completedIds }: DifficultySelectorProps) {
  const filters: Filter[] = ["all", "beginner", "intermediate", "advanced"];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((d) => {
        const info = d === "all" ? { label: "すべて", icon: "📚" } : DIFFICULTIES[d];
        const total = d === "all" ? CHALLENGES.length : CHALLENGES.filter((c) => c.difficulty === d).length;
        const completed = d === "all"
          ? completedIds.size
          : CHALLENGES.filter((c) => c.difficulty === d && completedIds.has(c.id)).length;
        const isActive = selected === d;

        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              isActive ? ACTIVE[d] + " shadow-lg scale-105" : IDLE[d]
            }`}
          >
            <span>{info.icon}</span>
            <span>{info.label}</span>
            <span className={`text-xs ml-1 ${isActive ? "opacity-70" : "text-gray-500"}`}>
              {completed}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
