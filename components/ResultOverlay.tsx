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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="px-6 py-6 space-y-4">

        {/* コース進捗バナー */}
        {courseProgress && (
          <div className="bg-blue-900/60 border border-blue-700 rounded-xl px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-blue-300 font-semibold truncate">{courseProgress.title}</span>
            <span className="text-blue-200 font-bold ml-2 shrink-0">
              {courseProgress.current}/{courseProgress.total}
            </span>
          </div>
        )}

        {/* ヘッダー */}
        <div className="text-center space-y-1">
          <div className="text-5xl">🎉</div>
          <h3 className="text-3xl font-bold text-green-400">クリア！</h3>
          <p className="text-yellow-400 text-2xl font-bold">+{points} pts</p>
        </div>

        {/* 今回の記録 */}
        <div className="bg-gray-800/80 rounded-xl border border-gray-600 p-4 space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">今回の記録</p>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">クリアタイム</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{formatTime(elapsedTime)}</span>
              {isNewBestTime && (
                <span className="text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">
                  NEW BEST
                </span>
              )}
              {!isNewBestTime && prevRecord && (
                <span className="text-gray-500 text-xs">
                  ベスト {formatTime(prevRecord.bestTime)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">キーストローク数</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{keystrokeCount} 回</span>
              {isNewBestKeys && (
                <span className="text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">
                  NEW BEST
                </span>
              )}
              {!isNewBestKeys && prevRecord && (
                <span className="text-gray-500 text-xs">
                  ベスト {prevRecord.bestKeystrokes} 回
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 模範解答 */}
        <div className="bg-gray-800/80 rounded-xl border border-gray-600 p-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">模範解答</p>
          <pre className="text-green-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {solution}
          </pre>
        </div>

        {/* ボタン */}
        <div className="space-y-2">
          <button
            onClick={onNext}
            className="w-full px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
          >
            {courseProgress?.isLast ? "コースを完了 ✓" : "次の問題へ →"}
          </button>
          <button
            onClick={onRetry}
            className="w-full px-8 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg font-semibold text-sm transition-colors"
          >
            もう一度解く ↺
          </button>
          <p className="text-gray-500 text-xs text-center">
            Enter → 次へ　｜　Backspace → もう一度
          </p>
        </div>

      </div>
      </div>
    </div>
  );
}
