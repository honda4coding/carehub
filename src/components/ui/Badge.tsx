import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider';
  
  const variants = {
    primary: 'bg-[hsl(var(--color-primary))] text-white',
    success: 'bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]',
    warning: 'bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]',
    danger: 'bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]',
    info: 'bg-[hsl(var(--color-text-muted)/0.1)] text-[hsl(var(--color-text-muted))]',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
