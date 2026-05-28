"use client";

import { Challenge, CATEGORIES, DIFFICULTIES } from "@/lib/challenges";

interface ChallengePanelProps {
  challenge: Challenge;
  score: number;
  streak: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  movement: "bg-blue-900 text-blue-300 border-blue-700",
  editing: "bg-green-900 text-green-300 border-green-700",
  mode: "bg-purple-900 text-purple-300 border-purple-700",
  search: "bg-orange-900 text-orange-300 border-orange-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-900 text-green-300",
  intermediate: "bg-yellow-900 text-yellow-300",
  advanced: "bg-red-900 text-red-300",
};

export default function ChallengePanel({ challenge, score, streak }: ChallengePanelProps) {
  const cat = CATEGORIES[challenge.category];
  const diff = DIFFICULTIES[challenge.difficulty];
  const catColor = CATEGORY_COLORS[challenge.category];
  const diffColor = DIFFICULTY_COLORS[challenge.difficulty];

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded border ${catColor}`}>
            {cat.icon} {cat.label}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${diffColor}`}>
            {diff.icon} {diff.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">
            スコア: <span className="text-white font-bold">{score}</span>
          </span>
          {streak > 1 && (
            <span className="text-yellow-400 font-bold animate-pulse">🔥 x{streak}</span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">{challenge.title}</h2>
        <p className="text-gray-300 text-sm leading-loose">{challenge.description}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>基本ポイント: <span className="text-green-400 font-bold">{challenge.points}</span></span>
        <span>ボーナス基準: <span className="text-blue-400 font-bold">{challenge.parTime}秒</span></span>
      </div>
    </div>
  );
}
