"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

interface Cmd {
  keys: string;
  desc: string;
  note?: string;
}

interface Section {
  id: string;
  label: string;
  icon: string;
  intro?: string;
  commands: Cmd[];
}

const SECTIONS: Section[] = [
  {
    id: "basic-movement",
    label: "基本移動",
    icon: "🏃",
    intro: "Normal モードでカーソルを動かす基本コマンド。hjkl は矢印キーより指を動かさず効率的。",
    commands: [
      { keys: "h", desc: "左へ1文字移動" },
      { keys: "j", desc: "下へ1行移動" },
      { keys: "k", desc: "上へ1行移動" },
      { keys: "l", desc: "右へ1文字移動" },
      { keys: "{n}j / {n}k", desc: "n 行下 / 上へ移動", note: "例: 5j で5行下へ" },
      { keys: "w", desc: "次の単語の先頭へ（記号も区切り）" },
      { keys: "W", desc: "次の単語の先頭へ（空白のみ区切り）", note: "W は記号を単語の一部として扱う" },
      { keys: "b", desc: "前の単語の先頭へ（記号も区切り）" },
      { keys: "B", desc: "前の単語の先頭へ（空白のみ区切り）" },
      { keys: "e", desc: "現在/次の単語の末尾へ" },
      { keys: "E", desc: "現在/次の単語の末尾へ（空白のみ区切り）" },
      { keys: "ge", desc: "前の単語の末尾へ" },
      { keys: "0", desc: "行頭（カラム 0）へ移動" },
      { keys: "^", desc: "行の最初の非空白文字へ移動", note: "インデントがある行では 0 と異なる" },
      { keys: "$", desc: "行末へ移動" },
      { keys: "g_", desc: "行末の最後の非空白文字へ移動" },
      { keys: "gg", desc: "ファイルの先頭へジャンプ" },
      { keys: "G", desc: "ファイルの末尾へジャンプ" },
      { keys: "{n}G", desc: "n 行目へジャンプ", note: "例: 42G で42行目へ。:42 でも同じ" },
      { keys: "H", desc: "画面の一番上の行へ移動（High）" },
      { keys: "M", desc: "画面の中央の行へ移動（Middle）" },
      { keys: "L", desc: "画面の一番下の行へ移動（Low）" },
    ],
  },
  {
    id: "inline-movement",
    label: "行内ジャンプ",
    icon: "🎯",
    intro: "f/t 系コマンドは行内の特定の文字へ素早く移動するための最重要コマンド。",
    commands: [
      { keys: "f{c}", desc: "行内で文字 c へ前方ジャンプ（c を含む）", note: "例: fa で行内の次の 'a' へ" },
      { keys: "F{c}", desc: "行内で文字 c へ後方ジャンプ（c を含む）" },
      { keys: "t{c}", desc: "行内で文字 c の手前へ前方ジャンプ（c を含まない）", note: "dt( で '(' の手前まで削除、など" },
      { keys: "T{c}", desc: "行内で文字 c の後ろへ後方ジャンプ（c を含まない）" },
      { keys: ";", desc: "直前の f/F/t/T を同方向に繰り返す" },
      { keys: ",", desc: "直前の f/F/t/T を逆方向に繰り返す" },
      { keys: "%", desc: "対応する括弧・タグへジャンプ", note: "( ) [ ] { } の間を往来できる" },
    ],
  },
  {
    id: "scroll",
    label: "スクロール",
    icon: "📜",
    intro: "長いファイルをカーソルを動かさずに表示位置だけ動かすコマンド。",
    commands: [
      { keys: "Ctrl+f", desc: "1画面分前方（下）にスクロール（Forward）" },
      { keys: "Ctrl+b", desc: "1画面分後方（上）にスクロール（Backward）" },
      { keys: "Ctrl+d", desc: "半画面分前方にスクロール（Down）" },
      { keys: "Ctrl+u", desc: "半画面分後方にスクロール（Up）" },
      { keys: "zz", desc: "カーソル行を画面中央に" },
      { keys: "zt", desc: "カーソル行を画面の上端に" },
      { keys: "zb", desc: "カーソル行を画面の下端に" },
    ],
  },
  {
    id: "insert-mode",
    label: "挿入モード",
    icon: "✍️",
    intro: "Normal モードから Insert モードへ入るコマンド。ESC または Ctrl+[ で Normal モードに戻る。",
    commands: [
      { keys: "i", desc: "カーソルの前（左）に挿入モードで入る" },
      { keys: "a", desc: "カーソルの後（右）に挿入モードで入る（Append）" },
      { keys: "I", desc: "行の最初の非空白文字の前に挿入モードで入る" },
      { keys: "A", desc: "行末に挿入モードで入る" },
      { keys: "o", desc: "カーソル行の下に新しい行を作り挿入モードで入る" },
      { keys: "O", desc: "カーソル行の上に新しい行を作り挿入モードで入る" },
      { keys: "s", desc: "カーソル下の1文字を削除して挿入モードで入る（Substitute）" },
      { keys: "S / cc", desc: "カーソル行全体を削除して挿入モードで入る" },
      { keys: "R", desc: "Replace モードで入る（文字を上書きし続ける）", note: "Insert モードと違い既存文字を上書き" },
      { keys: "r{c}", desc: "カーソル下の1文字だけを c に置換し Normal モードに留まる", note: "r は1文字だけ置換、R は連続上書き" },
      { keys: "ESC / Ctrl+[", desc: "Insert/Replace モードを終了し Normal モードへ戻る" },
    ],
  },
  {
    id: "delete",
    label: "削除",
    icon: "🗑️",
    intro: "削除コマンドは全て「レジスタ」にコピーされるので、直後に p でペーストできる。",
    commands: [
      { keys: "x", desc: "カーソル下の1文字を削除" },
      { keys: "X", desc: "カーソルの前の1文字を削除（Backspaceと同様）" },
      { keys: "dd", desc: "カーソル行を削除" },
      { keys: "{n}dd", desc: "カーソル行から n 行を削除", note: "例: 3dd で3行削除" },
      { keys: "D", desc: "カーソルから行末まで削除（d$ と同じ）" },
      { keys: "dw", desc: "カーソルから次の単語先頭まで削除（空白含む）" },
      { keys: "de", desc: "カーソルから単語末尾まで削除（空白含まず）" },
      { keys: "db", desc: "カーソルから前の単語先頭まで削除" },
      { keys: "d0", desc: "カーソルから行頭まで削除" },
      { keys: "d^", desc: "カーソルから最初の非空白文字まで削除" },
      { keys: "dgg", desc: "カーソルからファイル先頭まで削除" },
      { keys: "dG", desc: "カーソルからファイル末尾まで削除" },
      { keys: "dt{c}", desc: "行内で文字 c の手前まで削除", note: "例: dt) で ')' の手前まで削除" },
      { keys: "df{c}", desc: "行内で文字 c まで（c を含んで）削除" },
      { keys: "diw", desc: "カーソル下の単語を削除（テキストオブジェクト）", note: "周囲の空白は残る" },
      { keys: "daw", desc: "カーソル下の単語を周囲の空白ごと削除" },
    ],
  },
  {
    id: "change",
    label: "変更",
    icon: "🔄",
    intro: "c（Change）コマンドは削除してそのまま Insert モードに入る。d + i の組み合わせと同じ効果。",
    commands: [
      { keys: "cw", desc: "単語を削除して Insert モードで入る" },
      { keys: "ce", desc: "単語末尾まで削除して Insert モードで入る（cw と類似）" },
      { keys: "cb", desc: "前の単語先頭まで削除して Insert モードで入る" },
      { keys: "cc / S", desc: "行全体を削除して Insert モードで入る" },
      { keys: "C", desc: "カーソルから行末まで削除して Insert モードで入る" },
      { keys: "ciw", desc: "単語内を変更（テキストオブジェクト）", note: "カーソルが単語内ならどこでも有効" },
      { keys: "caw", desc: "単語を周囲の空白ごと変更" },
      { keys: "ci\"", desc: "ダブルクォート内を変更" },
      { keys: "ca\"", desc: "ダブルクォートを含めて変更" },
      { keys: "ci(", desc: "括弧内を変更（ci) も同じ）" },
      { keys: "ca(", desc: "括弧を含めて変更" },
      { keys: "ci{", desc: "波括弧内を変更" },
      { keys: "cit", desc: "HTMLタグの内側を変更（inner tag）" },
    ],
  },
  {
    id: "yank-paste",
    label: "コピー & ペースト",
    icon: "📋",
    intro: "Vim では「コピー」を「ヤンク（yank）」と呼ぶ。削除コマンドで削除した内容も自動的にレジスタに入る。",
    commands: [
      { keys: "yy / Y", desc: "カーソル行をヤンク（コピー）" },
      { keys: "{n}yy", desc: "カーソル行から n 行をヤンク", note: "例: 3yy で3行ヤンク" },
      { keys: "yw", desc: "カーソルから次の単語先頭までヤンク" },
      { keys: "ye", desc: "カーソルから単語末尾までヤンク" },
      { keys: "y$", desc: "カーソルから行末までヤンク" },
      { keys: "yiw", desc: "単語をヤンク（テキストオブジェクト）" },
      { keys: "yi\"", desc: "ダブルクォート内をヤンク" },
      { keys: "p", desc: "カーソルの後（次の行）にペースト" },
      { keys: "P", desc: "カーソルの前（前の行）にペースト" },
      { keys: "{n}p", desc: "n 回ペースト", note: "例: 5p で5回繰り返しペースト" },
      { keys: "yyp", desc: "現在行を複製（yy でヤンク → p でペースト）", note: "行の複製に最もよく使うパターン" },
    ],
  },
  {
    id: "text-objects",
    label: "テキストオブジェクト",
    icon: "🧩",
    intro: "d/c/y/v の後に使う「意味のある範囲」の指定方法。i は内側（inner）、a は外側（around）を意味する。",
    commands: [
      { keys: "iw / aw", desc: "単語（inner word / around word）", note: "aw は周囲の空白も含む" },
      { keys: "is / as", desc: "文（inner sentence / around sentence）" },
      { keys: "ip / ap", desc: "段落（inner paragraph / around paragraph）" },
      { keys: 'i" / a"', desc: "ダブルクォート内 / クォートを含む範囲" },
      { keys: "i' / a'", desc: "シングルクォート内 / クォートを含む範囲" },
      { keys: "i` / a`", desc: "バッククォート内 / クォートを含む範囲" },
      { keys: "i( / a(", desc: "丸括弧の内側 / 括弧を含む範囲（i) / a) も同じ）" },
      { keys: "i[ / a[", desc: "角括弧の内側 / 含む範囲（i] / a] も同じ）" },
      { keys: "i{ / a{", desc: "波括弧の内側 / 含む範囲（i} / a} も同じ）" },
      { keys: "it / at", desc: "HTML/XMLタグの内側 / タグを含む範囲", note: "例: cit で <div>ここ</div> の中身を変更" },
    ],
  },
  {
    id: "visual-mode",
    label: "ビジュアルモード",
    icon: "🔲",
    intro: "範囲を視覚的に選択してから操作するモード。選択後は d/y/c/>/</~/gU/gu などで操作できる。",
    commands: [
      { keys: "v", desc: "文字単位ビジュアルモードに入る" },
      { keys: "V", desc: "行単位ビジュアルモードに入る（行全体を選択）" },
      { keys: "Ctrl+v", desc: "矩形（ブロック）ビジュアルモードに入る", note: "複数行の同じ列を一括編集できる" },
      { keys: "o", desc: "ビジュアル選択中: 選択範囲の反対側の端へカーソルを移動" },
      { keys: "gv", desc: "直前のビジュアル選択を再選択" },
      { keys: "d / x", desc: "選択範囲を削除" },
      { keys: "y", desc: "選択範囲をヤンク" },
      { keys: "c", desc: "選択範囲を削除して Insert モードへ" },
      { keys: ">", desc: "選択範囲をインデント" },
      { keys: "<", desc: "選択範囲のインデントを戻す" },
      { keys: "~", desc: "選択範囲の大文字/小文字を反転" },
      { keys: "gU", desc: "選択範囲を大文字に変換" },
      { keys: "gu", desc: "選択範囲を小文字に変換" },
      { keys: "I（矩形選択時）", desc: "選択した全行の先頭に同じ文字を挿入", note: "ESC 後に一括挿入される" },
    ],
  },
  {
    id: "search",
    label: "検索",
    icon: "🔍",
    intro: "/ や ? で検索するとファイル全体に対してパターンマッチが行われる。正規表現が使用可能。",
    commands: [
      { keys: "/{pattern}", desc: "前方（下方向）に検索。Enter で実行", note: "正規表現が使用可能" },
      { keys: "?{pattern}", desc: "後方（上方向）に検索" },
      { keys: "n", desc: "次の検索一致へ（同方向）" },
      { keys: "N", desc: "前の検索一致へ（逆方向）" },
      { keys: "*", desc: "カーソル下の単語を前方検索", note: "完全一致のみ（\\bword\\b）" },
      { keys: "#", desc: "カーソル下の単語を後方検索" },
      { keys: "g*", desc: "カーソル下の単語を前方検索（部分一致も含む）" },
      { keys: ":noh", desc: "検索ハイライトを一時的に消去" },
      { keys: "/\\c{pattern}", desc: "大文字小文字を無視して検索（case insensitive）", note: "\\C を付けると逆に大文字小文字を区別" },
      { keys: "/{pattern}/e", desc: "検索してカーソルをマッチの末尾に置く" },
    ],
  },
  {
    id: "substitute",
    label: "置換",
    icon: "↔️",
    intro: ":s コマンドは行範囲と置換フラグを組み合わせて強力な一括置換ができる。% はファイル全体を意味する。",
    commands: [
      { keys: ":s/old/new/", desc: "カーソル行の最初の一致を置換" },
      { keys: ":s/old/new/g", desc: "カーソル行の全ての一致を置換（g = global）" },
      { keys: ":%s/old/new/g", desc: "ファイル全体で全ての一致を置換" },
      { keys: ":%s/old/new/gi", desc: "ファイル全体、大文字小文字無視で全置換" },
      { keys: ":%s/old/new/gc", desc: "ファイル全体で確認しながら置換（y/n で選択）" },
      { keys: ":5,10s/old/new/g", desc: "5〜10行目の範囲で全置換" },
      { keys: ":'<,'>s/old/new/g", desc: "ビジュアル選択範囲で全置換（V 選択後に : を押すと自動入力）" },
      { keys: ":%s/\\bword\\b/new/g", desc: "単語の完全一致で全置換（\\b は単語境界）" },
      { keys: ":g/{pattern}/d", desc: "パターンに一致する行を全て削除", note: "例: :g/^$/d で空行を全削除" },
      { keys: ":v/{pattern}/d", desc: "パターンに一致しない行を全て削除（:g! と同じ）", note: "例: :v/TODO/d で TODO 以外の行を削除" },
      { keys: ":g/{pattern}/s/old/new/g", desc: "パターンに一致する行だけで置換を実行" },
    ],
  },
  {
    id: "repeat-undo",
    label: "繰り返し & アンドゥ",
    icon: "🔁",
    intro: ".（ドット）コマンドは直前の変更操作を繰り返す Vim の最重要コマンドの一つ。",
    commands: [
      { keys: ".", desc: "直前の変更を同じ場所で繰り返す", note: "例: cw 変更後、次の単語に移動して . で同じ変更を適用" },
      { keys: "{n}{cmd}", desc: "コマンドを n 回繰り返す", note: "例: 3dw で単語3つ削除、5j で5行下へ" },
      { keys: "u", desc: "最後の変更をアンドゥ（Undo）" },
      { keys: "{n}u", desc: "n 回アンドゥ", note: "例: 5u で5回アンドゥ" },
      { keys: "Ctrl+r", desc: "アンドゥした変更をリドゥ（Redo）" },
      { keys: "U", desc: "カーソル行に加えた全ての変更をアンドゥ", note: "u と U は互いにアンドゥできる" },
    ],
  },
  {
    id: "case-indent",
    label: "大文字小文字 & インデント",
    icon: "🔤",
    commands: [
      { keys: "~", desc: "カーソル下の文字の大文字/小文字を反転して次の文字へ移動" },
      { keys: "g~{motion}", desc: "モーション範囲の大文字/小文字を反転", note: "例: g~w で単語の大文字小文字を反転" },
      { keys: "guu / gu{motion}", desc: "行全体 / モーション範囲を小文字に変換", note: "例: guiw で単語を小文字に" },
      { keys: "gUU / gU{motion}", desc: "行全体 / モーション範囲を大文字に変換", note: "例: gUiw で単語を大文字に" },
      { keys: ">>", desc: "カーソル行をインデント（右にシフト）" },
      { keys: "<<", desc: "カーソル行のインデントを戻す（左にシフト）" },
      { keys: "{n}>>", desc: "n 行をインデント", note: "例: 3>> で3行インデント" },
      { keys: "==", desc: "カーソル行を自動インデント" },
      { keys: "gg=G", desc: "ファイル全体を自動インデント", note: "gg でファイル先頭へ移動し = をファイル末尾（G）まで適用" },
      { keys: "={motion}", desc: "モーション範囲を自動インデント", note: "例: =ip で段落をインデント" },
    ],
  },
  {
    id: "line-ops",
    label: "行操作",
    icon: "📄",
    commands: [
      { keys: "J", desc: "次の行を現在行に結合（行間に空白を挿入）" },
      { keys: "gJ", desc: "次の行を現在行に結合（空白を挿入しない）" },
      { keys: "{n}J", desc: "n 行を現在行に結合", note: "例: 3J で3行を1行にまとめる" },
      { keys: ":m {n}", desc: "現在行を n 行目の後ろに移動", note: "例: :m 10 で10行目の次へ移動。:m $ でファイル末尾へ" },
      { keys: ":m+{n} / :m-{n}", desc: "現在行を n 行下 / 上へ移動", note: "例: :m+1 で1行下へ、:m-2 で2行上へ" },
      { keys: ":co {n} / :t {n}", desc: "現在行を n 行目の後ろにコピー", note: "例: :t0 で行をファイル先頭にコピー" },
      { keys: ":5,10m 20", desc: "5〜10行目を20行目の後ろに移動" },
    ],
  },
  {
    id: "macro",
    label: "マクロ",
    icon: "🎬",
    intro: "マクロは一連の操作を記録して繰り返し実行できる機能。複雑な繰り返し編集を自動化できる。",
    commands: [
      { keys: "q{c}", desc: "レジスタ c にマクロの記録を開始", note: "例: qa でレジスタ 'a' に記録開始。レジスタは a-z の26種類" },
      { keys: "q（記録中）", desc: "マクロの記録を終了" },
      { keys: "@{c}", desc: "レジスタ c のマクロを実行", note: "例: @a でレジスタ 'a' のマクロを実行" },
      { keys: "@@", desc: "直前に実行したマクロを再実行" },
      { keys: "{n}@{c}", desc: "レジスタ c のマクロを n 回実行", note: "例: 100@a で100回繰り返す" },
      { keys: ":reg {c}", desc: "レジスタ c の内容を表示して確認" },
    ],
  },
  {
    id: "marks",
    label: "マーク & ジャンプ",
    icon: "📌",
    intro: "マークはファイル内の位置を記憶する機能。後で素早くその位置に戻れる。",
    commands: [
      { keys: "m{c}", desc: "現在位置をマーク c に保存（c は a-z）", note: "大文字（A-Z）はファイルをまたいだグローバルマーク" },
      { keys: "'{c}", desc: "マーク c の行の先頭へジャンプ" },
      { keys: "`{c}", desc: "マーク c の正確な位置（行+列）へジャンプ" },
      { keys: "''", desc: "直前のジャンプ位置の行頭へ戻る" },
      { keys: "``", desc: "直前のジャンプの正確な位置へ戻る" },
      { keys: "Ctrl+o", desc: "ジャンプリストを遡って前の位置へ" },
      { keys: "Ctrl+i", desc: "ジャンプリストを進んで次の位置へ" },
      { keys: ":marks", desc: "全マークの一覧を表示" },
    ],
  },
  {
    id: "ex-commands",
    label: "Ex コマンド",
    icon: "⌨️",
    intro: ": で始まるコマンド。ファイル操作や設定変更など幅広い操作が可能。",
    commands: [
      { keys: ":w", desc: "ファイルを保存（Write）" },
      { keys: ":w {file}", desc: "別名で保存" },
      { keys: ":q", desc: "Vim を終了（未保存の変更があると失敗）" },
      { keys: ":wq / ZZ", desc: "保存して終了" },
      { keys: ":q! / ZQ", desc: "保存せずに強制終了" },
      { keys: ":e {file}", desc: "別のファイルを開く" },
      { keys: ":e!", desc: "現在のファイルを再読み込み（変更を破棄）" },
      { keys: ":r {file}", desc: "ファイルの内容をカーソル下に挿入" },
      { keys: ":{n}", desc: "n 行目へジャンプ（{n}G と同じ）" },
      { keys: ":set number", desc: "行番号を表示" },
      { keys: ":set relativenumber", desc: "相対行番号を表示" },
      { keys: ":set hlsearch", desc: "検索ハイライトを有効化" },
      { keys: ":set ignorecase", desc: "検索で大文字小文字を無視" },
    ],
  },
];

function Keys({ text }: { text: string }) {
  return (
    <code className="font-mono text-xs bg-gray-800 text-green-300 px-1.5 py-0.5 rounded border border-gray-700 whitespace-nowrap">
      {text}
    </code>
  );
}

export default function CommandsPage() {
  const [query, setQuery] = useState("");
  const handleBack = useCallback(() => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = "/";
    }
  }, []);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Observe sections to update active nav link on scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (query) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const results: Array<{ sectionId: string; sectionLabel: string; sectionIcon: string; commands: Cmd[] }> = [];
    for (const section of SECTIONS) {
      const matched = section.commands.filter(
        (c) =>
          c.keys.toLowerCase().includes(q) ||
          c.desc.toLowerCase().includes(q) ||
          (c.note?.toLowerCase().includes(q) ?? false)
      );
      if (matched.length > 0) {
        results.push({ sectionId: section.id, sectionLabel: section.label, sectionIcon: section.icon, commands: matched });
      }
    }
    return results;
  }, [query]);

  const totalCount = SECTIONS.reduce((s, sec) => s + sec.commands.length, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 sticky top-0 z-30 bg-gray-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold font-mono text-green-400 hover:text-green-300 transition-colors">
              VimForge
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white font-semibold">コマンド一覧</span>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
          >
            ← ゲームに戻る
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20 space-y-0.5">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-3 pb-2">
              {totalCount} コマンド
            </p>
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeSection === sec.id && !query
                    ? "bg-green-900/40 text-green-300 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{sec.icon}</span>
                <span className="truncate">{sec.label}</span>
              </a>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-2">
          {/* Search */}
          <div className="sticky top-20 z-20 pb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="コマンドを検索… 例: dw, ヤンク, 削除"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/40 font-mono"
            />
            {query && (
              <p className="text-xs text-gray-500 mt-1.5 px-1">
                {filtered?.reduce((s, r) => s + r.commands.length, 0) ?? 0} 件ヒット
              </p>
            )}
          </div>

          {/* Filtered results */}
          {query && filtered && (
            <div className="space-y-6">
              {filtered.length === 0 ? (
                <p className="text-gray-500 text-center py-16">「{query}」に一致するコマンドが見つかりませんでした</p>
              ) : (
                filtered.map((group) => (
                  <CommandSection
                    key={group.sectionId}
                    id={group.sectionId}
                    label={group.sectionLabel}
                    icon={group.sectionIcon}
                    commands={group.commands}
                    refCallback={() => null}
                  />
                ))
              )}
            </div>
          )}

          {/* All sections */}
          {!query && (
            <div className="space-y-6">
              {SECTIONS.map((section) => (
                <CommandSection
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  icon={section.icon}
                  intro={section.intro}
                  commands={section.commands}
                  refCallback={(el) => { sectionRefs.current[section.id] = el; }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

interface CommandSectionProps {
  id: string;
  label: string;
  icon: string;
  intro?: string;
  commands: Cmd[];
  refCallback: (el: HTMLElement | null) => void;
}

function CommandSection({ id, label, icon, intro, commands, refCallback }: CommandSectionProps) {
  return (
    <section
      id={id}
      ref={refCallback}
      className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden scroll-mt-24"
    >
      <div className="px-5 py-4 border-b border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>{icon}</span>
          <span>{label}</span>
        </h2>
        {intro && <p className="text-gray-400 text-sm mt-1 leading-relaxed">{intro}</p>}
      </div>
      <div className="divide-y divide-gray-800">
        {commands.map((cmd, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-4 hover:bg-gray-800/50 transition-colors">
            <div className="w-52 shrink-0 pt-0.5">
              <Keys text={cmd.keys} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-100">{cmd.desc}</p>
              {cmd.note && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{cmd.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
