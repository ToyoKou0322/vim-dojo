"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, drawSelection } from "@codemirror/view";
import { vim, Vim, getCM } from "@replit/codemirror-vim";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { cpp } from "@codemirror/lang-cpp";
import { Language } from "@/lib/challenges";

// Module-level state — safe to keep here (no DOM access)
let _activeView: EditorView | null = null;
let _yankRegistered = false;

function toHalfWidth(key: string): string {
  if (key.length !== 1) return key;
  const code = key.charCodeAt(0);
  // 全角英数記号 U+FF01–U+FF5E → 半角 U+0021–U+007E
  if (code >= 0xFF01 && code <= 0xFF5E) return String.fromCharCode(code - 0xFEE0);
  // 全角スペース U+3000 → 半角スペース
  if (code === 0x3000) return ' ';
  return key;
}

function detectIndentUnit(content: string): string {
  for (const line of content.split("\n")) {
    if (line.startsWith("\t")) return "\t";
  }
  let min = Infinity;
  for (const line of content.split("\n")) {
    const m = line.match(/^( +)\S/);
    if (m) min = Math.min(min, m[1].length);
  }
  return " ".repeat(min === Infinity ? 2 : min);
}


function getLanguageExtension(lang?: Language) {
  if (lang === "javascript") return javascript({ jsx: true });
  if (lang === "python") return python();
  if (lang === "html") return html();
  if (lang === "css") return css();
  if (lang === "cpp") return cpp();
  return null;
}

interface VimEditorProps {
  initialContent: string;
  targetContent: string;
  onContentChange: (content: string) => void;
  onModeChange: (mode: string) => void;
  onKeystroke?: () => void;
  isActive: boolean;
  disableMouse?: boolean;
  language?: Language;
}

export default function VimEditor({
  initialContent,
  targetContent,
  onContentChange,
  onModeChange,
  onKeystroke,
  isActive,
  disableMouse = true,
  language,
}: VimEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [currentMode, setCurrentMode] = useState("NORMAL");

  const handleModeChange = useCallback(
    (mode: string) => {
      setCurrentMode(mode);
      onModeChange(mode);
    },
    [onModeChange]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const langExt = getLanguageExtension(language);
    // 全角→半角変換ハンドラ
    // ケース A (IME 経由: useNextTextInput=true):
    //   langmap が vimKeyFromEvent 内で ｊ→j へ変換する。
    //   ここでは false を返し vim 自身の inputHandler に任せる。
    // ケース B (keydown 経由: useNextTextInput=false):
    //   vim はすでに keydown でカーソルを動かしている。
    //   全角テキストがドキュメントに挿入されないよう true を返してキャンセル。
    const fullWidthInputHandler = Prec.highest(
      EditorView.inputHandler.of((view, _from, _to, text) => {
        if (text.length !== 1) return false;
        if (toHalfWidth(text) === text) return false; // 半角ならスキップ
        const cm = getCM(view);
        if (!cm) return false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vimState = (cm as any).state?.vim;
        if (!vimState || vimState.insertMode) return false; // INSERT モードは挿入を許可
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vimPlugin = (cm as any).state?.vimPlugin;
        if (vimPlugin?.useNextTextInput) return false; // ケース A: vim に任せる
        return true; // ケース B: 挿入だけキャンセル
      })
    );

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        fullWidthInputHandler,
        vim({
          status: true,
        }),
        lineNumbers(),
        drawSelection(),
        ...(langExt ? [langExt] : []),
        oneDark,
        history(),
        keymap.of([
          // INSERT/REPLACE mode: insert spaces matching the file's indent width.
          // Other modes (NORMAL, VISUAL): block browser focus navigation only.
          {
            key: "Tab",
            run: (view) => {
              const mode = view.dom.querySelector(".cm-vim-panel")?.textContent ?? "";
              if (mode.includes("INSERT") || mode.includes("REPLACE")) {
                const unit = detectIndentUnit(initialContent);
                view.dispatch(view.state.replaceSelection(unit));
                return true;
              }
              return true;
            },
            shift: () => true,
          },
          ...historyKeymap,
          ...defaultKeymap,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onContentChange(update.state.doc.toString());
          }
        }),
        ...(disableMouse ? [EditorView.domEventHandlers({
          mousedown: (event, view) => {
            event.preventDefault();
            view.focus();
            return true;
          },
          contextmenu: (event) => {
            event.preventDefault();
            return true;
          },
        })] : []),
        EditorView.theme({
          "&": {
            fontSize: "16px",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          },
          ".cm-content": {
            padding: "16px",
            minHeight: "360px",
          },
          ".cm-focused": {
            outline: "none",
          },
          ".cm-editor": {
            borderRadius: "0 0 8px 8px",
          },
          ".cm-vim-panel": {
            backgroundColor: "#1a1a2e",
            color: "#e2e8f0",
            padding: "4px 8px",
            borderTop: "1px solid #4a5568",
          },
        }),
      ],
    });

    // Clear the global vim search state so previous challenge's search
    // pattern doesn't bleed into the new challenge (n would jump without /)
    const globalState = (Vim as unknown as { getVimGlobalState_?: () => Record<string, unknown> }).getVimGlobalState_?.();
    if (globalState) {
      globalState.query = null;
      globalState.lastSearchQuery = "";
      globalState.isReversed = false;
    }

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    _activeView = view;

    if (!_yankRegistered) {
      _yankRegistered = true;

      // 全角英数記号 (U+FF01–FF5E) を半角にマッピングする langmap を設定。
      // langmap は vimKeyFromEvent 内で照合されるため、IME 経由のケースで機能する。
      // ,(U+002C) と \(U+005C) は langmap のパース文字なのでスキップ。
      let langFrom = "", langTo = "";
      for (let i = 0xFF01; i <= 0xFF5E; i++) {
        const half = String.fromCharCode(i - 0xFEE0);
        if (half === "," || half === "\\") continue;
        langFrom += String.fromCharCode(i);
        langTo += half;
      }
      Vim.langmap(langFrom + ";" + langTo, false);

      const copyToClipboard = (text: string) => {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      };

      Vim.defineEx("yank", "y", () => {
        if (!_activeView) return;
        const text = _activeView.state.doc.toString();
        const lineCount = _activeView.state.doc.lines;

        const globalState = (Vim as unknown as {
          getVimGlobalState_?: () => {
            registerController?: {
              pushText: (name: string, op: string, text: string, linewise: boolean, blockwise: boolean) => void;
            };
          };
        }).getVimGlobalState_?.();
        globalState?.registerController?.pushText('"', 'yank', text + '\n', true, false);

        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).catch(() => copyToClipboard(text));
        } else {
          copyToClipboard(text);
        }

        // Defer by one frame so the vim plugin's own panel update runs first,
        // then we overwrite with the yank message. The next keystroke will restore it.
        const view = _activeView;
        const msg = `${lineCount} lines yanked!`;
        setTimeout(() => {
          const panel = view.dom.querySelector(".cm-vim-panel");
          if (panel) panel.textContent = msg;
        }, 0);
      });
    }

    // Listen for mode changes via CodeMirror Vim
    // The vim extension fires custom events on the editor DOM
    const editorDom = editorRef.current;
    const modeObserver = new MutationObserver(() => {
      // Read mode from the vim status bar
      const statusEl = editorDom.querySelector(".cm-vim-panel");
      if (statusEl) {
        const text = statusEl.textContent || "";
        if (text.includes("INSERT")) handleModeChange("INSERT");
        else if (text.includes("VISUAL")) handleModeChange("VISUAL");
        else if (text.includes("REPLACE")) handleModeChange("REPLACE");
        else handleModeChange("NORMAL");
      }
    });

    modeObserver.observe(editorDom, { subtree: true, childList: true, characterData: true });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        onKeystroke?.();
      }
    };
    view.contentDOM.addEventListener("keydown", handleKeyDown);

    // Vim command/search mode (: / ?) causes the browser to scroll to the panel.
    // Track the last known scroll position and restore it whenever a scroll fires
    // while the panel is showing a command prefix.
    let lastScrollY = window.scrollY;
    const suppressCommandScroll = () => {
      const text = editorDom.querySelector(".cm-vim-panel")?.textContent ?? "";
      if (text.startsWith(":") || text.startsWith("/") || text.startsWith("?")) {
        window.scrollTo(window.scrollX, lastScrollY);
      } else {
        lastScrollY = window.scrollY;
      }
    };
    window.addEventListener("scroll", suppressCommandScroll);

    if (isActive) {
      view.focus();
    }

    return () => {
      view.contentDOM.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", suppressCommandScroll);
      modeObserver.disconnect();
      view.destroy();
      _activeView = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  useEffect(() => {
    if (!viewRef.current) return;
    if (isActive) {
      viewRef.current.focus();
    } else {
      viewRef.current.contentDOM.blur();
    }
  }, [isActive]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-400 text-sm ml-2 font-mono">vim</span>
      </div>
      <div ref={editorRef} className="min-h-[360px]" />
    </div>
  );
}
