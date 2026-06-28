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
    <div className="bg-gradient-to-b from-[hsl(var(--color-bg-surface))] to-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))] shadow-sm rounded-2xl py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center mx-auto mb-4 text-[26px] ring-4 ring-[hsl(var(--color-primary)/0.05)]">
        {icon}
      </div>
      <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">
        {title}
      </h3>
      <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] max-w-sm mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
