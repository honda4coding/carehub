import React from 'react';
import LanguageSwitcher from "@/components/global/LanguageSwitcher";

interface TopbarProps {
  title: string;
  subtitle?: string | React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, rightElement }) => {
  return (
    <header className="bg-[hsl(var(--color-bg-surface))] z-40 relative border-b border-[hsl(var(--color-border))] px-4 md:px-6 h-[73px] flex items-center justify-between shrink-0">
      <div className="md:block min-w-0">
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] tracking-tight ps-11 md:pl-0 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 ps-11 md:pl-0 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <LanguageSwitcher />
        {rightElement && rightElement}
      </div>
    </header>
  );
};
