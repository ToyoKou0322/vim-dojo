"use client";

interface ModeIndicatorProps {
  mode: string;
}

const MODE_STYLES: Record<string, { bg: string; label: string }> = {
  NORMAL: { bg: "bg-blue-600", label: "NORMAL" },
  INSERT: { bg: "bg-green-600", label: "INSERT" },
  VISUAL: { bg: "bg-purple-600", label: "VISUAL" },
  REPLACE: { bg: "bg-red-600", label: "REPLACE" },
};

export default function ModeIndicator({ mode }: ModeIndicatorProps) {
  const style = MODE_STYLES[mode] ?? MODE_STYLES.NORMAL;

  return (
    <div className={`${style.bg} px-3 py-1 rounded text-white text-sm font-mono font-bold tracking-widest`}>
      -- {style.label} --
    </div>
  );
}
