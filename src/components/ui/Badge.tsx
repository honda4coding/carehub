import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors';
  
  const variants = {
    primary: 'bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary-strong))]',
    success: 'bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]',
    warning: 'bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]',
    danger: 'bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]',
    info: 'bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]',
    outline: 'bg-transparent border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
