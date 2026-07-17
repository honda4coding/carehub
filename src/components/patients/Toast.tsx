"use client";

interface Props {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
}

export default function Toast({ message, type = "error", onClose }: Props) {
  let bgClass = "bg-[hsl(var(--color-bg-surface))]";
  let textClass = "text-[hsl(var(--color-text))]";
  let borderClass = "border-[hsl(var(--color-border))]";
  let btnClass = "text-[hsl(var(--color-text-muted))]";

  if (type === "error") {
    bgClass = "bg-[hsl(var(--color-danger-bg))]";
    textClass = "text-[hsl(var(--color-danger))]";
    borderClass = "border-[hsl(var(--color-danger))/0.2]";
    btnClass = "text-[hsl(var(--color-danger))/0.7] hover:text-[hsl(var(--color-danger))]";
  } else if (type === "success") {
    bgClass = "bg-[hsl(var(--color-success))/0.1]";
    textClass = "text-[hsl(var(--color-success))]";
    borderClass = "border-[hsl(var(--color-success))/0.2]";
    btnClass = "text-[hsl(var(--color-success))/0.7] hover:text-[hsl(var(--color-success))]";
  } else {
    bgClass = "bg-[hsl(var(--color-primary))/0.1]";
    textClass = "text-[hsl(var(--color-primary))]";
    borderClass = "border-[hsl(var(--color-primary))/0.2]";
    btnClass = "text-[hsl(var(--color-primary))/0.7] hover:text-[hsl(var(--color-primary))]";
  }

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] flex items-center gap-2 ${bgClass} border ${borderClass} ${textClass} text-[13px] font-bold px-4 py-3 rounded-xl shadow-lg`}>
      {message}
      <button onClick={onClose} className={`ml-2 ${btnClass} font-bold transition-colors`}>✕</button>
    </div>
  );
}
