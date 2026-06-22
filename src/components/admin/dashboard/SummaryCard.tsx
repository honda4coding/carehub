import React from 'react';
import { IconType } from 'react-icons';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  colorTheme: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'indigo';
}

export default function SummaryCard({ title, value, icon: Icon, colorTheme }: SummaryCardProps) {
  // Mapping color themes to Tailwind classes or CSS variables
  const colorMap = {
    primary: {
      bg: 'bg-[hsl(var(--color-primary)/0.15)]',
      text: 'text-primary',
    },
    secondary: {
      bg: 'bg-[hsl(var(--color-secondary)/0.15)]',
      text: 'text-[hsl(var(--color-secondary-strong))]',
    },
    success: {
      bg: 'bg-[hsl(var(--color-success)/0.15)]',
      text: 'text-[hsl(var(--color-success))]',
    },
    warning: {
      bg: 'bg-[hsl(var(--color-warning-bg))]',
      text: 'text-[hsl(var(--color-warning))]',
    },
    danger: {
      bg: 'bg-[hsl(var(--color-danger-bg))]',
      text: 'text-[hsl(var(--color-danger))]',
    },
    indigo: {
      bg: 'bg-[hsl(var(--color-indigo-bg))]',
      text: 'text-[hsl(var(--color-indigo))]',
    }
  };

  const theme = colorMap[colorTheme] || colorMap.primary;

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-[10px] ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <Icon className="text-xl" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">{title}</p>
        <p className="text-[20px] font-black text-[hsl(var(--color-text))]">{value}</p>
      </div>
    </div>
  );
}
