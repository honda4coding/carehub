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
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:ring-offset-2 active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-strong))] shadow-sm',
      secondary: 'bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary))] hover:bg-[hsl(var(--color-secondary)/0.25)]',
      gradient: 'bg-gradient-brand text-white hover:opacity-90 shadow-sm',
      outline: 'bg-transparent border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.05)]',
      ghost: 'bg-transparent text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))]',
      danger: 'bg-[hsl(var(--color-danger))] text-white hover:opacity-90 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2.5',
    };

    const innerContent = (
      <>
        {isLoading ? (
          <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" style={{ marginRight: children ? '8px' : '0' }} />
        ) : Icon && iconPosition === 'left' ? (
          <Icon className="w-5 h-5 shrink-0" style={{ marginRight: children ? '8px' : '0' }} />
        ) : null}
        
        {children}

        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className="w-5 h-5 shrink-0" style={{ marginLeft: children ? '8px' : '0' }} />
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
