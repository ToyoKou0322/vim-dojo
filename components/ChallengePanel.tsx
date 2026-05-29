"use client";

import { Challenge, CATEGORIES, DIFFICULTIES } from "@/lib/challenges";

interface ChallengePanelProps {
  challenge: Challenge;
  score: number;
  streak: number;
}

const CATEGORY_STYLES: Record<string, string> = {
  movement: "border-[#00e5ff] text-[#00e5ff] bg-[rgba(0,229,255,0.06)]",
  editing:  "border-[#39ff14] text-[#39ff14] bg-[rgba(57,255,20,0.06)]",
  mode:     "border-[#9d4edd] text-[#9d4edd] bg-[rgba(157,78,221,0.06)]",
  search:   "border-[#ff00aa] text-[#ff00aa] bg-[rgba(255,0,170,0.06)]",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner:     "border-[#39ff14] text-[#39ff14] bg-[rgba(57,255,20,0.06)]",
  intermediate: "border-[#ffdd00] text-[#ffdd00] bg-[rgba(255,221,0,0.06)]",
  advanced:     "border-[#ff00aa] text-[#ff00aa] bg-[rgba(255,0,170,0.06)]",
};

export default function ChallengePanel({ challenge, score, streak }: ChallengePanelProps) {
  const cat = CATEGORIES[challenge.category];
  const diff = DIFFICULTIES[challenge.difficulty];

  return (
    <div className="cyber-card rounded p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold font-mono px-2 py-1 rounded border ${CATEGORY_STYLES[challenge.category]}`}>
            {cat.icon} {cat.label}
          </span>
          <span className={`text-xs font-semibold font-mono px-2 py-1 rounded border ${DIFFICULTY_STYLES[challenge.difficulty]}`}>
            {diff.icon} {diff.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono">
          <span style={{ color: "var(--dim)" }}>
            スコア: <span className="text-white font-bold">{score}</span>
          </span>
          {streak > 1 && (
            <span className="neon-pink font-bold animate-pulse">🔥 ×{streak}</span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white font-mono mb-2">{challenge.title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--dim)" }}>
          {challenge.description}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm font-mono" style={{ color: "var(--dim)" }}>
        <span>基本ポイント: <span className="neon-cyan font-bold">{challenge.points}</span></span>
        <span>ボーナス基準: <span className="text-[#00e5ff] font-bold">{challenge.parTime}秒</span></span>
      </div>
    </div>
  );
}
