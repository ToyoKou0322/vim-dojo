"use client";

import { Category } from "@/lib/challenges";

interface CommandReferenceProps {
  activeCategory?: Category;
}

const SECTIONS = [
  {
    category: "movement" as Category,
    label: "移動",
    color: "text-blue-400",
    borderColor: "border-blue-700",
    bgColor: "bg-blue-950/40",
    commands: [
      { keys: "h / j / k / l", desc: "左/下/上/右" },
      { keys: "w / b", desc: "次/前の単語先頭" },
      { keys: "e", desc: "単語末尾" },
      { keys: "0 / $", desc: "行頭/行末" },
      { keys: "gg / G", desc: "ファイル先頭/末尾" },
      { keys: "nG", desc: "n 行目へジャンプ" },
      { keys: "f{c}", desc: "行内の文字 c へ" },
      { keys: ";", desc: "直前の f を繰り返す" },
    ],
  },
  {
    category: "mode" as Category,
    label: "挿入",
    color: "text-purple-400",
    borderColor: "border-purple-700",
    bgColor: "bg-purple-950/40",
    commands: [
      { keys: "i / a", desc: "カーソル前/後に挿入" },
      { keys: "I / A", desc: "行頭/末に挿入" },
      { keys: "o / O", desc: "下/上に新行を挿入" },
      { keys: "R", desc: "Replace モード" },
      { keys: "v / V", desc: "文字/行の Visual" },
      { keys: "<Esc>", desc: "Normal モードへ" },
    ],
  },
  {
    category: "editing" as Category,
    label: "編集",
    color: "text-green-400",
    borderColor: "border-green-700",
    bgColor: "bg-green-950/40",
    commands: [
      { keys: "x", desc: "1 文字削除" },
      { keys: "r{c}", desc: "1 文字置換" },
      { keys: "dd / yy", desc: "行削除/ヤンク" },
      { keys: "p / P", desc: "下/上にペースト" },
      { keys: "dw / cw", desc: "単語を削除/変更" },
      { keys: "D / C", desc: "行末まで削除/変更" },
      { keys: "df{c}", desc: "文字 c まで削除" },
      { keys: "d3w", desc: "3 単語まとめて削除" },
      { keys: "ciw", desc: "単語内を変更" },
      { keys: "J", desc: "次の行と結合" },
      { keys: "u", desc: "アンドゥ" },
    ],
  },
  {
    category: "search" as Category,
    label: "検索・置換",
    color: "text-orange-400",
    borderColor: "border-orange-700",
    bgColor: "bg-orange-950/40",
    commands: [
      { keys: "/{pat}", desc: "前方検索" },
      { keys: "?{pat}", desc: "後方検索" },
      { keys: "n / N", desc: "次/前の一致へ" },
      { keys: "*", desc: "カーソル下の単語を検索" },
      { keys: ":%s/old/new/g", desc: "全置換" },
      { keys: ":%s/old/new/gi", desc: "大小文字無視で全置換" },
      { keys: ":g/{pat}/d", desc: "マッチした行を削除" },
    ],
  },
];

export default function CommandReference({ activeCategory }: CommandReferenceProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
      <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wide">
        コマンドリファレンス
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTIONS.map((section) => {
          const isActive = section.category === activeCategory;
          return (
            <div
              key={section.category}
              className={`rounded-lg border p-3 transition-colors ${
                isActive
                  ? `${section.bgColor} ${section.borderColor}`
                  : "border-gray-700 bg-gray-800/50"
              }`}
            >
              <p className={`text-xs font-bold mb-2 ${isActive ? section.color : "text-gray-400"}`}>
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.commands.map(({ keys, desc }) => (
                  <li key={keys} className="flex items-baseline gap-1.5">
                    <code
                      className={`text-xs font-mono shrink-0 ${
                        isActive ? section.color : "text-gray-300"
                      }`}
                    >
                      {keys}
                    </code>
                    <span className="text-gray-500 text-xs leading-tight">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
