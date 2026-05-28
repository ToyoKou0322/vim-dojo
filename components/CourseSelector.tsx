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
          <h2 className="text-2xl font-bold text-white">コースを選択</h2>
          <p className="text-gray-400 text-sm mt-1">順序立てた問題で体系的に学習</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
        >
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
            <div
              key={course.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl leading-none mt-0.5">{course.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white">{course.title}</h3>
                    {isAllDone && (
                      <span className="text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">
                        完了
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{completed} / {total} 問クリア</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => onSelect(course, startIndex)}
                className="mt-auto w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors"
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
