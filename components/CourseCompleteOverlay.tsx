"use client";

import { Course } from "@/lib/courses";

interface CourseCompleteOverlayProps {
  course: Course;
  totalChallenges: number;
  onBackToList: () => void;
  onReplay: () => void;
}

export default function CourseCompleteOverlay({
  course,
  totalChallenges,
  onBackToList,
  onReplay,
}: CourseCompleteOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[rgba(5,5,26,0.85)] backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="cyber-card w-full max-w-sm mx-4 rounded"
        style={{ boxShadow: "0 0 40px rgba(255,0,170,0.15), 0 0 80px rgba(0,229,255,0.06)" }}
      >
        <div className="px-6 py-8 space-y-5 text-center">
          <div className="space-y-3">
            <div className="text-5xl">{course.icon}</div>
            <div className="font-mono text-sm" style={{ color: "var(--dim)" }}>// COURSE COMPLETE</div>
            <h3 className="text-3xl font-bold font-mono neon-pink">コースクリア！</h3>
            <p className="text-white font-semibold font-mono">{course.title}</p>
          </div>

          <div className="rounded border border-[var(--border2)] p-4 bg-[var(--surface2)]">
            <div className="text-4xl font-bold font-mono neon-cyan">{totalChallenges}</div>
            <div className="text-sm mt-1 font-mono" style={{ color: "var(--dim)" }}>問クリア</div>
          </div>

          <p className="text-sm font-mono" style={{ color: "var(--dim)" }}>
            {course.description}の全問題を制覇しました！
          </p>

          <div className="space-y-2">
            <button
              onClick={onReplay}
              className="btn-neon-cyan w-full py-2.5 rounded font-bold font-mono transition-all"
            >
              もう一度 ↺
            </button>
            <button
              onClick={onBackToList}
              className="btn-ghost w-full py-2 rounded font-semibold text-sm font-mono transition-all"
            >
              コース一覧に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
