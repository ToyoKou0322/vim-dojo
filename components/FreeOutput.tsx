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
    <div
      className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-widest border-b border-[var(--border)]"
      style={{ color: "var(--dim)", background: "var(--surface2)" }}
    >
      // {label}
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
      <div className="cyber-card rounded p-4 font-mono text-sm" style={{ color: "var(--dim)" }}>
        {data.message}
      </div>
    );
  }

  if (data.type === "html") {
    return (
      <div className="cyber-card rounded overflow-hidden">
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
      <div className="cyber-card rounded overflow-hidden">
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
      <div className="cyber-card rounded overflow-hidden">
        <PanelHeader label="標準出力" />
        <div className="p-4 font-mono text-sm min-h-[60px] max-h-64 overflow-y-auto" style={{ background: "var(--surface)" }}>
          {!hasOutput ? (
            <p className="font-mono" style={{ color: "var(--dim2)" }}>出力なし</p>
          ) : (
            <>
              {stdoutLines.map((line, i) => (
                <p key={`out-${i}`} className="neon-cyan">{line || " "}</p>
              ))}
              {stderrLines.map((line, i) => (
                <p key={`err-${i}`} className="text-[#ff3860]">{line || " "}</p>
              ))}
            </>
          )}
          {data.exitCode !== 0 && (
            <p className="text-[#ffdd00] mt-2 text-xs border-t border-[var(--border)] pt-2 font-mono">
              終了コード: {data.exitCode}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card rounded overflow-hidden">
      <PanelHeader label="出力" />
      <div className="p-4 font-mono text-sm min-h-[60px] max-h-64 overflow-y-auto" style={{ background: "var(--surface)" }}>
        {data.lines.length === 0 ? (
          <p style={{ color: "var(--dim2)" }}>出力なし</p>
        ) : (
          data.lines.map((line, i) => (
            <p
              key={i}
              className={line.startsWith("[error]") ? "text-[#ff3860]" : "neon-cyan"}
            >
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
