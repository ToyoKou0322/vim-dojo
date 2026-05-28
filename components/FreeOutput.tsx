"use client";

export type FreeOutputData =
  | { type: "console"; lines: string[]; hasError: boolean }
  | { type: "html"; content: string }
  | { type: "css"; content: string }
  | { type: "io"; stdout: string; stderr: string; exitCode: number }
  | { type: "unsupported"; message: string };

const CSS_SAMPLE_HTML = `
<body style="padding:16px;font-family:sans-serif;">
  <div class="container">
    <div class="card">
      <h2 class="title">Sample Title</h2>
      <p>This is a preview card for your CSS.</p>
      <button class="button">Button</button>
    </div>
  </div>
</body>`;

function PanelHeader({ label }: { label: string }) {
  return (
    <div className="bg-gray-800 px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-700">
      {label}
    </div>
  );
}

function parseLines(s: string): string[] {
  if (!s) return [];
  const lines = s.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export default function FreeOutput({ data }: { data: FreeOutputData }) {
  if (data.type === "unsupported") {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 text-gray-400 text-sm">
        {data.message}
      </div>
    );
  }

  if (data.type === "html") {
    return (
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <PanelHeader label="プレビュー" />
        <iframe
          srcDoc={data.content}
          className="w-full h-64 bg-white"
          sandbox="allow-scripts"
          title="HTML Preview"
        />
      </div>
    );
  }

  if (data.type === "css") {
    return (
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <PanelHeader label="CSS プレビュー" />
        <iframe
          srcDoc={`<style>${data.content}</style>${CSS_SAMPLE_HTML}`}
          className="w-full h-64 bg-white"
          sandbox="allow-scripts"
          title="CSS Preview"
        />
      </div>
    );
  }

  if (data.type === "io") {
    const stdoutLines = parseLines(data.stdout);
    const stderrLines = parseLines(data.stderr);
    const hasOutput = stdoutLines.length > 0 || stderrLines.length > 0;

    return (
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <PanelHeader label="標準出力" />
        <div className="bg-gray-950 p-4 font-mono text-sm min-h-[60px] max-h-64 overflow-y-auto">
          {!hasOutput ? (
            <p className="text-gray-600">出力なし</p>
          ) : (
            <>
              {stdoutLines.map((line, i) => (
                <p key={`out-${i}`} className="text-green-300">{line || " "}</p>
              ))}
              {stderrLines.map((line, i) => (
                <p key={`err-${i}`} className="text-red-400">{line || " "}</p>
              ))}
            </>
          )}
          {data.exitCode !== 0 && (
            <p className="text-yellow-600 mt-2 text-xs border-t border-gray-800 pt-2">
              終了コード: {data.exitCode}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      <PanelHeader label="出力" />
      <div className="bg-gray-950 p-4 font-mono text-sm min-h-[60px] max-h-64 overflow-y-auto">
        {data.lines.length === 0 ? (
          <p className="text-gray-600">出力なし</p>
        ) : (
          data.lines.map((line, i) => (
            <p
              key={i}
              className={line.startsWith("[error]") ? "text-red-400" : "text-green-300"}
            >
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
