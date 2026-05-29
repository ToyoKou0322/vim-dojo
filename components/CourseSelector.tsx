"use client";

import { Course, COURSES } from "@/lib/courses";

interface CourseSelectorProps {
  completedIds: Set<string>;
  onSelect: (course: Course, startIndex: number) => void;
  onBack: () => void;
}

export default function CourseSelector({ completedIds, onSelect, onBack }: CourseSelectorProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-mono neon-cyan">コースを選択</h2>
          <p className="text-sm mt-1 font-mono" style={{ color: "var(--dim)" }}>
            // 順序立てた問題で体系的に学習
          </p>
        </div>
        <button onClick={onBack} className="btn-ghost px-4 py-1.5 rounded text-sm font-semibold font-mono transition-colors">
          ← 戻る
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COURSES.map((course) => {
          const total = course.challengeIds.length;
          const completed = course.challengeIds.filter((id) => completedIds.has(id)).length;
          const isAllDone = completed === total;
          const firstUncompleted = course.challengeIds.findIndex((id) => !completedIds.has(id));
          const startIndex = firstUncompleted === -1 ? 0 : firstUncompleted;
          const pct = total > 0 ? (completed / total) * 100 : 0;

          return (
            <div key={course.id} className="cyber-card rounded p-5 space-y-3 flex flex-col">
              <div className="flex items-start gap-3">
                <span className="text-3xl leading-none mt-0.5">{course.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white font-mono">{course.title}</h3>
                    {isAllDone && (
                      <span className="text-xs border border-[#ffdd00] text-[#ffdd00] font-bold px-1.5 py-0.5 rounded font-mono">
                        完了
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 font-mono" style={{ color: "var(--dim)" }}>
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono" style={{ color: "var(--dim)" }}>
                  <span>{completed} / {total} 問クリア</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      background: "var(--cyan)",
                      boxShadow: "0 0 6px var(--cyan)",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => onSelect(course, startIndex)}
                className="btn-neon-cyan mt-auto w-full py-2 rounded text-sm font-bold font-mono transition-all"
              >
                {completed === 0
                  ? "スタート ▶"
                  : isAllDone
                  ? "再挑戦 ↺"
                  : `続ける → (${completed + 1}/${total})`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
