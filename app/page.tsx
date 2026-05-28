"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CHALLENGES, Challenge, Difficulty, Language } from "@/lib/challenges";
import { initialGameState, GameState, calculateScore } from "@/lib/gameState";
import { saveRecord, ChallengeRecord } from "@/lib/records";
import ChallengePanel from "@/components/ChallengePanel";
import ModeIndicator from "@/components/ModeIndicator";
import Timer from "@/components/Timer";
import ResultOverlay from "@/components/ResultOverlay";
import DifficultySelector from "@/components/DifficultySelector";
import CategorySelector from "@/components/CategorySelector";
import CommandReference from "@/components/CommandReference";
import FreeOutput, { FreeOutputData } from "@/components/FreeOutput";
import CourseSelector from "@/components/CourseSelector";
import CourseCompleteOverlay from "@/components/CourseCompleteOverlay";
import { Course, COURSES } from "@/lib/courses";

const VimEditor = dynamic(() => import("@/components/VimEditor"), { ssr: false });

function normalizeContent(s: string): string {
  return s.replace(/\r\n/g, "\n").trimEnd();
}

function pickChallenge(
  difficulty: GameState["selectedDifficulty"],
  category: GameState["selectedCategory"],
  completedIds: Set<string>,
  exclude?: string
): Challenge | null {
  const pool = CHALLENGES.filter(
    (c) =>
      (difficulty === "all" || c.difficulty === difficulty) &&
      (category === "all" || c.category === category) &&
      c.id !== exclude
  );
  if (pool.length === 0) return null;
  const uncompleted = pool.filter((c) => !completedIds.has(c.id));
  const source = uncompleted.length > 0 ? uncompleted : pool;
  return source[Math.floor(Math.random() * source.length)];
}

type FreeLanguage = "text" | Language;

const FREE_STARTERS: Record<FreeLanguage, { label: string; content: string; language?: Language }> = {
  text: {
    label: "テキスト",
    content: "",
  },
  javascript: {
    label: "JavaScript",
    language: "javascript",
    content: [
      "function main() {",
      "",
      "}",
      "",
      "main();",
    ].join("\n"),
  },
  python: {
    label: "Python",
    language: "python",
    content: [
      "def main():",
      "    pass",
      "",
      "",
      "if __name__ == \"__main__\":",
      "    main()",
    ].join("\n"),
  },
  html: {
    label: "HTML",
    language: "html",
    content: [
      "<!DOCTYPE html>",
      "<html lang=\"ja\">",
      "  <head>",
      "    <meta charset=\"UTF-8\">",
      "    <title>Document</title>",
      "  </head>",
      "  <body>",
      "  </body>",
      "</html>",
    ].join("\n"),
  },
  css: {
    label: "CSS",
    language: "css",
    content: [
      "* {",
      "  box-sizing: border-box;",
      "  margin: 0;",
      "  padding: 0;",
      "}",
    ].join("\n"),
  },
  cpp: {
    label: "C++",
    language: "cpp",
    content: [
      "#include <bits/stdc++.h>",
      "using namespace std;",
      "",
      "int main() {",
      "",
      "  return 0;",
      "}",
    ].join("\n"),
  },
};

const FREE_LANG_ORDER: FreeLanguage[] = ["text", "javascript", "html", "css", "cpp", "python"];

export default function Home() {
  const [game, setGame] = useState<GameState>(initialGameState);
  const [editorKey, setEditorKey] = useState(0);
  const [vimMode, setVimMode] = useState("NORMAL");
  const [lastPoints, setLastPoints] = useState(0);
  const [lastKeystrokeCount, setLastKeystrokeCount] = useState(0);
  const [prevRecord, setPrevRecord] = useState<ChallengeRecord | null>(null);
  const [freeLanguage, setFreeLanguage] = useState<FreeLanguage>("text");
  const [freeContent, setFreeContent] = useState(FREE_STARTERS["text"].content);
  const [freeInput, setFreeInput] = useState("");
  const [freeOutput, setFreeOutput] = useState<FreeOutputData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const currentContentRef = useRef<string>("");
  const keystrokesRef = useRef(0);

  const startChallenge = useCallback((challenge: Challenge) => {
    currentContentRef.current = challenge.initialContent;
    keystrokesRef.current = 0;
    setEditorKey((k) => k + 1);
    setVimMode("NORMAL");
    setGame((g) => ({
      ...g,
      status: "playing",
      currentChallenge: challenge,
      elapsedTime: 0,
      lastResult: null,
    }));
  }, []);

  const handleStart = useCallback(() => {
    const challenge = pickChallenge(game.selectedDifficulty, game.selectedCategory, game.completedIds);
    if (challenge) startChallenge(challenge);
  }, [game.selectedDifficulty, game.selectedCategory, game.completedIds, startChallenge]);

  const handleSelectCourse = useCallback((course: Course, startIndex: number) => {
    const id = course.challengeIds[startIndex];
    const challenge = CHALLENGES.find((c) => c.id === id);
    if (!challenge) return;
    currentContentRef.current = challenge.initialContent;
    keystrokesRef.current = 0;
    setEditorKey((k) => k + 1);
    setVimMode("NORMAL");
    setGame((g) => ({
      ...g,
      status: "playing",
      currentChallenge: challenge,
      currentCourse: course,
      courseIndex: startIndex,
      elapsedTime: 0,
      lastResult: null,
    }));
  }, []);

  const handleFree = useCallback(() => {
    setVimMode("NORMAL");
    setEditorKey((k) => k + 1);
    setGame((g) => ({ ...g, status: "free", currentChallenge: null }));
  }, []);

  const handleSuccess = useCallback(() => {
    setGame((g) => {
      if (!g.currentChallenge) return g;
      const points = calculateScore(
        g.currentChallenge.points,
        g.elapsedTime,
        g.currentChallenge.parTime,
        g.streak
      );
      setLastPoints(points);
      const keystrokes = keystrokesRef.current;
      setLastKeystrokeCount(keystrokes);
      const { prev } = saveRecord(g.currentChallenge.id, g.elapsedTime, keystrokes);
      setPrevRecord(prev);
      return {
        ...g,
        status: "showing-result",
        lastResult: "success",
        score: g.score + points,
        streak: g.streak + 1,
        completedIds: new Set([...g.completedIds, g.currentChallenge.id]),
      };
    });
  }, []);

  const handleTick = useCallback(() => {
    setGame((g) => {
      if (g.status !== "playing") return g;
      return { ...g, elapsedTime: g.elapsedTime + 1 };
    });
  }, []);

  const handleContentChange = useCallback(
    (content: string) => {
      currentContentRef.current = content;
      if (!game.currentChallenge || game.status !== "playing") return;
      if (normalizeContent(content) === normalizeContent(game.currentChallenge.targetContent)) {
        handleSuccess();
      }
    },
    [game.currentChallenge, game.status, handleSuccess]
  );

  const handleNext = useCallback(() => {
    if (game.currentCourse) {
      const nextIndex = game.courseIndex + 1;
      if (nextIndex >= game.currentCourse.challengeIds.length) {
        setGame((g) => ({ ...g, status: "course-complete" }));
        return;
      }
      const nextId = game.currentCourse.challengeIds[nextIndex];
      const nextChallenge = CHALLENGES.find((c) => c.id === nextId);
      if (nextChallenge) {
        currentContentRef.current = nextChallenge.initialContent;
        keystrokesRef.current = 0;
        setEditorKey((k) => k + 1);
        setVimMode("NORMAL");
        setGame((g) => ({
          ...g,
          status: "playing",
          currentChallenge: nextChallenge,
          courseIndex: nextIndex,
          elapsedTime: 0,
          lastResult: null,
        }));
      }
      return;
    }
    const next = pickChallenge(
      game.selectedDifficulty,
      game.selectedCategory,
      game.completedIds,
      game.currentChallenge?.id
    );
    if (next) {
      startChallenge(next);
    } else {
      setGame((g) => ({ ...g, status: "idle", currentChallenge: null }));
    }
  }, [game.currentCourse, game.courseIndex, game.selectedDifficulty, game.selectedCategory, game.completedIds, game.currentChallenge?.id, startChallenge]);

  const handleRetry = useCallback(() => {
    setGame((g) => {
      if (!g.currentChallenge) return g;
      currentContentRef.current = g.currentChallenge.initialContent;
      keystrokesRef.current = 0;
      setEditorKey((k) => k + 1);
      setVimMode("NORMAL");
      return { ...g, status: "playing", elapsedTime: 0, lastResult: null };
    });
  }, []);

  const handleChangeFreeLanguage = useCallback((lang: FreeLanguage) => {
    setFreeLanguage(lang);
    setFreeContent(FREE_STARTERS[lang].content);
    setFreeInput("");
    setFreeOutput(null);
    setIsRunning(false);
    setVimMode("NORMAL");
    setEditorKey((k) => k + 1);
  }, []);

  const handleRun = useCallback(async () => {
    if (freeLanguage === "html") {
      setFreeOutput({ type: "html", content: freeContent });
      return;
    }
    if (freeLanguage === "css") {
      setFreeOutput({ type: "css", content: freeContent });
      return;
    }
    if (freeLanguage === "python" || freeLanguage === "cpp") {
      setIsRunning(true);
      setFreeOutput(null);
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: freeLanguage,
            code: freeContent,
            stdin: freeInput,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as {
          run?: { stdout: string; stderr: string; code: number };
          error?: string;
          message?: string;
        };
        if (data.error) throw new Error(data.error);
        if (!data.run) throw new Error(data.message ?? "実行に失敗しました");
        setFreeOutput({
          type: "io",
          stdout: data.run.stdout,
          stderr: data.run.stderr,
          exitCode: data.run.code,
        });
      } catch (e) {
        setFreeOutput({
          type: "io",
          stdout: "",
          stderr: `実行エラー: ${e instanceof Error ? e.message : "不明なエラー"}`,
          exitCode: -1,
        });
      } finally {
        setIsRunning(false);
      }
      return;
    }
    if (freeLanguage === "javascript") {
      setIsRunning(true);
      const id = Math.random().toString(36).slice(2);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "display:none;position:fixed;top:-9999px;";
      iframe.setAttribute("sandbox", "allow-scripts");

      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout>;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        window.removeEventListener("message", handler);
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        setIsRunning(false);
      };

      const handler = (e: MessageEvent) => {
        if (!e.data || e.data.id !== id) return;
        cleanup();
        setFreeOutput({ type: "console", lines: e.data.lines as string[], hasError: e.data.hasError as boolean });
      };
      window.addEventListener("message", handler);

      timeoutId = setTimeout(() => {
        cleanup();
        setFreeOutput({ type: "console", lines: ["[error] タイムアウト: 無限ループの可能性があります"], hasError: true });
      }, 5000);

      const encodedId = JSON.stringify(id);
      const encodedCode = JSON.stringify(freeContent);
      iframe.srcdoc = `<!DOCTYPE html><html><body><script>(function(){
const lines=[];let hasError=false;
const fmt=(...a)=>a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ');
console.log=(...a)=>lines.push(fmt(...a));
console.error=(...a)=>{lines.push('[error] '+fmt(...a));hasError=true;};
console.warn=(...a)=>lines.push('[warn] '+fmt(...a));
try{eval(${encodedCode});}catch(e){lines.push('[error] '+e.message);hasError=true;}
window.parent.postMessage({id:${encodedId},lines,hasError},'*');
})();<\/script></body></html>`;

      document.body.appendChild(iframe);
      return;
    }
  }, [freeLanguage, freeContent, freeInput]);

  useEffect(() => {
    if (game.status !== "showing-result") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "Backspace") {
        e.preventDefault();
        handleRetry();
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [game.status, handleNext, handleRetry]);

  const completedCount = game.completedIds.size;
  const totalCount = CHALLENGES.length;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGame((g) => ({ ...g, status: "idle", currentChallenge: null, currentCourse: null, courseIndex: 0 }))}
              className="text-2xl font-bold font-mono text-green-400 hover:text-green-300 transition-colors cursor-pointer"
            >
              VimDojo
            </button>
            <span className="text-gray-500 text-sm">Vim 練習ゲーム</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/commands"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              コマンド一覧
            </Link>
            <span className="text-gray-400">
              クリア: <span className="text-white font-bold">{completedCount}/{totalCount}</span>
            </span>
            <span className="text-gray-400">
              スコア: <span className="text-yellow-400 font-bold text-lg">{game.score}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-3">
        {game.status !== "free" && game.status !== "course-select" && !game.currentCourse && (
          <>
            <DifficultySelector
              selected={game.selectedDifficulty}
              onChange={(d) => setGame((g) => ({ ...g, selectedDifficulty: d as Difficulty | "all" }))}
              completedIds={game.completedIds}
            />
            <CategorySelector
              selected={game.selectedCategory}
              onChange={(cat) => setGame((g) => ({ ...g, selectedCategory: cat as GameState["selectedCategory"] }))}
              completedIds={game.completedIds}
            />
          </>
        )}

        {game.status === "idle" && (
          <div className="text-center py-16 space-y-6">
            <div className="text-6xl">⚡</div>
            <h1 className="text-4xl font-bold">VimDojo へようこそ！</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Vim のコマンドを実際に入力しながら練習できるゲームです。
              難易度とカテゴリを選んでスタートしましょう。
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-100"
              >
                スタート ▶
              </button>
              <button
                onClick={() => setGame((g) => ({ ...g, status: "course-select" }))}
                className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-100"
              >
                コースモード 📚
              </button>
              <button
                onClick={handleFree}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-100"
              >
                フリーモード
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-8">
              {[
                { icon: "🌱", label: "初級", desc: "基本コマンドの練習" },
                { icon: "⚡", label: "中級", desc: "実際のコードを編集" },
                { icon: "🔥", label: "上級", desc: "複数ステップの本格編集" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {game.status === "course-select" && (
          <CourseSelector
            completedIds={game.completedIds}
            onSelect={handleSelectCourse}
            onBack={() => setGame((g) => ({ ...g, status: "idle" }))}
          />
        )}

        {game.status === "free" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm font-semibold">言語:</span>
                {FREE_LANG_ORDER.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleChangeFreeLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      freeLanguage === lang
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {FREE_STARTERS[lang].label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setGame((g) => ({ ...g, status: "idle" }))}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
              >
                ← メニューに戻る
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <ModeIndicator mode={vimMode} />
                {freeLanguage !== "text" && (
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="px-4 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-bold transition-colors font-mono"
                  >
                    {isRunning ? "実行中..." : "▶ 実行"}
                  </button>
                )}
              </div>
              <VimEditor
                key={`free-${editorKey}`}
                initialContent={FREE_STARTERS[freeLanguage].content}
                targetContent=""
                onContentChange={setFreeContent}
                onModeChange={setVimMode}
                isActive={true}
                disableMouse={false}
                language={FREE_STARTERS[freeLanguage].language}
              />
              {(freeLanguage === "python" || freeLanguage === "cpp") && (
                <div className="rounded-xl border border-gray-700 overflow-hidden">
                  <div className="bg-gray-800 px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-700">
                    標準入力
                  </div>
                  <textarea
                    value={freeInput}
                    onChange={(e) => setFreeInput(e.target.value)}
                    placeholder="テストケースの入力をここに貼り付け..."
                    className="w-full bg-gray-950 p-4 font-mono text-sm text-gray-200 placeholder-gray-700 resize-none h-24 focus:outline-none"
                    spellCheck={false}
                  />
                </div>
              )}
              {freeOutput && <FreeOutput data={freeOutput} />}
              <p className="text-gray-600 text-xs text-center">
                自由に Vim コマンドを練習しよう · ESC で Normal モードへ
              </p>
              <CommandReference />
            </div>
          </div>
        )}

        {(game.status === "playing" || game.status === "showing-result") &&
          game.currentChallenge && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3">
              <div className="lg:col-span-1 space-y-4">
                <ChallengePanel
                  challenge={game.currentChallenge}
                  score={game.score}
                  streak={game.streak}
                />
                <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
                  <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wide">
                    目標テキスト
                  </p>
                  <pre className="text-green-300 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                    {game.currentChallenge.targetContent}
                  </pre>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ModeIndicator mode={vimMode} />
                    <Timer
                      elapsedTime={game.elapsedTime}
                      isRunning={game.status === "playing"}
                      onTick={handleTick}
                    />
                  </div>

                  <div className={game.status === "showing-result" ? "invisible" : ""}>
                    <VimEditor
                      key={editorKey}
                      initialContent={game.currentChallenge.initialContent}
                      targetContent={game.currentChallenge.targetContent}
                      onContentChange={handleContentChange}
                      onModeChange={setVimMode}
                      onKeystroke={() => { keystrokesRef.current++; }}
                      isActive={game.status === "playing"}
                      language={game.currentChallenge.language}
                    />
                  </div>

                  <p className="text-gray-600 text-xs text-center">
                    エディタをクリックして入力開始 · ESC で Normal モードへ
                  </p>
                </div>

                {game.status === "showing-result" && game.lastResult && (
                  <ResultOverlay
                    points={lastPoints}
                    elapsedTime={game.elapsedTime}
                    keystrokeCount={lastKeystrokeCount}
                    prevRecord={prevRecord}
                    solution={game.currentChallenge.solution}
                    onNext={handleNext}
                    onRetry={handleRetry}
                    courseProgress={
                      game.currentCourse
                        ? {
                            title: game.currentCourse.title,
                            current: game.courseIndex + 1,
                            total: game.currentCourse.challengeIds.length,
                            isLast:
                              game.courseIndex + 1 >=
                              game.currentCourse.challengeIds.length,
                          }
                        : undefined
                    }
                  />
                )}

              </div>
              <div className="lg:col-span-3">
                <CommandReference activeCategory={game.currentChallenge.category} />
              </div>
            </div>
          )}

        {game.status === "course-complete" && game.currentCourse && (
          <CourseCompleteOverlay
            course={game.currentCourse}
            totalChallenges={game.currentCourse.challengeIds.length}
            onBackToList={() =>
              setGame((g) => ({
                ...g,
                status: "course-select",
                currentCourse: null,
                currentChallenge: null,
                courseIndex: 0,
              }))
            }
            onReplay={() => {
              if (!game.currentCourse) return;
              handleSelectCourse(game.currentCourse, 0);
            }}
          />
        )}
      </div>
    </main>
  );
}
