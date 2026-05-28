export interface ChallengeRecord {
  bestTime: number;
  bestKeystrokes: number;
}

const STORAGE_KEY = "vimforge_records";
const PROGRESS_KEY = "vimforge_progress";

export interface GameProgress {
  completedIds: string[];
  score: number;
  selectedDifficulty: string;
  selectedCategory: string;
}

export function loadProgress(): GameProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as GameProgress) : null;
  } catch {
    return null;
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

function load(): Record<string, ChallengeRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getRecord(id: string): ChallengeRecord | null {
  return load()[id] ?? null;
}

export function saveRecord(
  id: string,
  time: number,
  keystrokes: number
): { prev: ChallengeRecord | null; isNewBestTime: boolean; isNewBestKeystrokes: boolean } {
  const all = load();
  const prev = all[id] ?? null;
  all[id] = {
    bestTime: prev ? Math.min(prev.bestTime, time) : time,
    bestKeystrokes: prev ? Math.min(prev.bestKeystrokes, keystrokes) : keystrokes,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
  return {
    prev,
    isNewBestTime: !prev || time < prev.bestTime,
    isNewBestKeystrokes: !prev || keystrokes < prev.bestKeystrokes,
  };
}
