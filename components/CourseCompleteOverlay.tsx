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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-sm mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        <div className="px-6 py-8 space-y-5 text-center">
          <div className="space-y-2">
            <div className="text-6xl">{course.icon}</div>
            <h3 className="text-3xl font-bold text-yellow-400">コースクリア！</h3>
            <p className="text-white font-semibold text-lg">{course.title}</p>
          </div>

          <div className="bg-gray-800/80 rounded-xl border border-gray-600 p-4">
            <div className="text-4xl font-bold text-green-400">{totalChallenges}</div>
            <div className="text-gray-400 text-sm mt-1">問クリア</div>
          </div>

          <p className="text-gray-400 text-sm">
            {course.description}の全問題を制覇しました！
          </p>

          <div className="space-y-2">
            <button
              onClick={onReplay}
              className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
            >
              もう一度 ↺
            </button>
            <button
              onClick={onBackToList}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg font-semibold text-sm transition-colors"
            >
              コース一覧に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
