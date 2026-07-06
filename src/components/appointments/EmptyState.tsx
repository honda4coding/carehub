import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-20 px-6 text-center max-w-sm mx-auto flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full bg-[hsl(var(--color-primary)/0.05)] text-[hsl(var(--color-primary))] flex items-center justify-center mb-6 text-[32px] ring-1 ring-[hsl(var(--color-primary)/0.1)] shadow-inner">
        {icon}
      </div>
      <h3 className="text-[18px] font-black text-[hsl(var(--color-text))] mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-[14px] font-semibold text-[hsl(var(--color-text-muted))/0.8] max-w-[280px] mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
