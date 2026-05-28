export interface ChallengeRecord {
  bestTime: number;
  bestKeystrokes: number;
}

const STORAGE_KEY = "vimdojo_records";

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
