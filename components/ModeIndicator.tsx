"use client";

interface ModeIndicatorProps {
  mode: string;
}

const MODE_STYLES: Record<string, { border: string; text: string; glow: string; label: string }> = {
  NORMAL:  { border: "border-[#00e5ff]", text: "text-[#00e5ff]", glow: "shadow-[0_0_10px_rgba(0,229,255,0.5)]", label: "NORMAL" },
  INSERT:  { border: "border-[#39ff14]", text: "text-[#39ff14]", glow: "shadow-[0_0_10px_rgba(57,255,20,0.5)]",  label: "INSERT" },
  VISUAL:  { border: "border-[#ff00aa]", text: "text-[#ff00aa]", glow: "shadow-[0_0_10px_rgba(255,0,170,0.5)]", label: "VISUAL" },
  REPLACE: { border: "border-[#ff3860]", text: "text-[#ff3860]", glow: "shadow-[0_0_10px_rgba(255,56,96,0.5)]",  label: "REPLACE" },
};

export default function ModeIndicator({ mode }: ModeIndicatorProps) {
  const style = MODE_STYLES[mode] ?? MODE_STYLES.NORMAL;

  return (
    <div
      className={`border ${style.border} ${style.text} ${style.glow} px-3 py-1 rounded text-sm font-mono font-bold tracking-widest bg-[var(--surface)]`}
      style={{ textShadow: "inherit" }}
    >
      -- {style.label} --
    </div>
  );
}
