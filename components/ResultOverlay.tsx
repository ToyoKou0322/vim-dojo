"use client";

import { ChallengeRecord } from "@/lib/records";

interface CourseProgress {
  current: number;
  total: number;
  title: string;
  isLast: boolean;
}

interface ResultOverlayProps {
  points: number;
  elapsedTime: number;
  keystrokeCount: number;
  prevRecord: ChallengeRecord | null;
  solution: string;
  onNext: () => void;
  onRetry: () => void;
  courseProgress?: CourseProgress;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

export default function ResultOverlay({
  points,
  elapsedTime,
  keystrokeCount,
  prevRecord,
  solution,
  onNext,
  onRetry,
  courseProgress,
}: ResultOverlayProps) {
  const isNewBestTime = !prevRecord || elapsedTime < prevRecord.bestTime;
  const isNewBestKeys = !prevRecord || keystrokeCount < prevRecord.bestKeystrokes;

  return (
    <div className="fixed inset-0 bg-[rgba(5,5,26,0.85)] backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="cyber-card w-full max-w-md mx-4 rounded shadow-[0_0_40px_rgba(0,229,255,0.15)] max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 40px rgba(0,229,255,0.12), 0 0 80px rgba(255,0,170,0.06)" }}
      >
        <div className="px-6 py-6 space-y-4">

          {courseProgress && (
            <div className="border border-[#9d4edd] rounded px-4 py-2 flex items-center justify-between text-sm font-mono bg-[rgba(157,78,221,0.06)]">
              <span className="text-[#9d4edd] font-semibold truncate">{courseProgress.title}</span>
              <span className="text-[#9d4edd] font-bold ml-2 shrink-0">
                {courseProgress.current}/{courseProgress.total}
              </span>
            </div>
          )}

          <div className="text-center space-y-2 py-2">
            <div className="font-mono text-sm" style={{ color: "var(--dim)" }}>// STAGE CLEAR</div>
            <h3 className="text-3xl font-bold font-mono neon-cyan">クリア！</h3>
            <p className="neon-pink text-2xl font-bold font-mono">+{points} pts</p>
          </div>

          <div className="rounded border border-[var(--border2)] p-4 space-y-3 bg-[var(--surface2)]">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--dim)" }}>
              // 今回の記録
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono" style={{ color: "var(--text)" }}>クリアタイム</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold font-mono">{formatTime(elapsedTime)}</span>
                {isNewBestTime && (
                  <span className="text-xs border border-[#ffdd00] text-[#ffdd00] font-bold px-1.5 py-0.5 rounded font-mono">
                    NEW BEST
                  </span>
                )}
                {!isNewBestTime && prevRecord && (
                  <span className="text-xs font-mono" style={{ color: "var(--dim)" }}>
                    ベスト {formatTime(prevRecord.bestTime)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono" style={{ color: "var(--text)" }}>キーストローク数</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold font-mono">{keystrokeCount} 回</span>
                {isNewBestKeys && (
                  <span className="text-xs border border-[#ffdd00] text-[#ffdd00] font-bold px-1.5 py-0.5 rounded font-mono">
                    NEW BEST
                  </span>
                )}
                {!isNewBestKeys && prevRecord && (
                  <span className="text-xs font-mono" style={{ color: "var(--dim)" }}>
                    ベスト {prevRecord.bestKeystrokes} 回
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded border border-[var(--border2)] p-4 bg-[var(--surface2)]">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--dim)" }}>
              // 模範解答
            </p>
            <pre className="neon-cyan font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {solution}
            </pre>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={onNext}
              className="btn-neon-cyan w-full px-8 py-2.5 rounded font-semibold font-mono transition-all"
            >
              {courseProgress?.isLast ? "コースを完了 ✓" : "次の問題へ →"}
            </button>
            <button
              onClick={onRetry}
              className="btn-ghost w-full px-8 py-2 rounded font-semibold text-sm font-mono transition-all"
            >
              もう一度解く ↺
            </button>
            <p className="text-xs text-center font-mono" style={{ color: "var(--dim2)" }}>
              Enter → 次へ　｜　Backspace → もう一度
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
