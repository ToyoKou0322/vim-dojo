import { Category, Difficulty, Challenge } from "./challenges";
import { Course } from "./courses";

export interface GameState {
  status: "idle" | "playing" | "showing-result" | "free" | "course-select" | "course-complete";
  currentChallenge: Challenge | null;
  currentCourse: Course | null;
  courseIndex: number;
  score: number;
  streak: number;
  elapsedTime: number;
  completedIds: Set<string>;
  lastResult: "success" | null;
  selectedCategory: Category | "all";
  selectedDifficulty: Difficulty | "all";
}

export const initialGameState: GameState = {
  status: "idle",
  currentChallenge: null,
  currentCourse: null,
  courseIndex: 0,
  score: 0,
  streak: 0,
  elapsedTime: 0,
  completedIds: new Set(),
  lastResult: null,
  selectedCategory: "all",
  selectedDifficulty: "all",
};

export function calculateScore(
  basePoints: number,
  elapsedTime: number,
  parTime: number,
  streak: number
): number {
  const timeBonus = Math.max(0, (parTime * 2 - elapsedTime) * 3);
  const streakMultiplier = 1 + streak * 0.1;
  return Math.floor((basePoints + timeBonus) * streakMultiplier);
}
