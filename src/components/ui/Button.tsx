import React, { ButtonHTMLAttributes } from 'react';
import { IconType } from 'react-icons';
import Link from 'next/link';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isLoading,
      href,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
    
    const variants = {
      primary: 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-strong))] hover:-translate-y-0.5',
      secondary: 'bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary))] hover:bg-[hsl(var(--color-secondary)/0.25)] hover:-translate-y-0.5',
      gradient: 'bg-linear-to-r from-[#0891B2] to-[hsl(var(--color-primary))] text-white hover:opacity-90 hover:-translate-y-0.5',
      outline: 'bg-transparent border-2 border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.05)] hover:-translate-y-0.5',
      ghost: 'bg-transparent text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]',
      danger: 'bg-[hsl(var(--color-danger))] text-white hover:opacity-90 hover:-translate-y-0.5',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      icon: 'p-3',
    };

    const innerContent = (
      <>
        {isLoading ? (
          <span className="me-2 animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" />
        ) : Icon && iconPosition === 'left' ? (
          <Icon className={`${children ? 'me-2' : ''} w-5 h-5 shrink-0`} />
        ) : null}
        
        {children}

        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className={`${children ? 'ms-2' : ''} w-5 h-5 shrink-0`} />
        )}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
          {innerContent}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {innerContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
