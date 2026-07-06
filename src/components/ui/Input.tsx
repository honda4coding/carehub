import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, leftIcon, rightIcon, size = 'md', ...props }, ref) => {
    const sizeStyles = {
      sm: 'py-2 px-3 text-sm rounded-md',
      md: 'py-2.5 px-3 text-base rounded-[10px]',
      lg: 'py-3.5 px-4 text-lg rounded-xl'
    };

    const baseStyles = `w-full ${sizeStyles[size]} outline-none transition-all duration-200 placeholder:text-[hsl(var(--color-text-muted)/0.6)] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] cursor-text`;
    
    const errorStyles = error 
      ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.02)] focus:border-[hsl(var(--color-danger))] focus:ring-[3px] focus:ring-[hsl(var(--color-danger)/0.15)]' 
      : 'focus:border-[hsl(var(--color-primary))] focus:ring-[3px] focus:ring-[hsl(var(--color-primary)/0.15)] hover:border-[hsl(var(--color-border-strong, var(--color-border)))]';

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className={`absolute left-0 top-0 bottom-0 flex items-center justify-center text-[hsl(var(--color-text-muted))] ${size === 'sm' ? 'w-9 text-[14px]' : 'w-11 text-[18px]'}`}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${
            leftIcon ? (size === 'sm' ? 'pl-9' : 'pl-11') : ''
          } ${rightIcon ? (size === 'sm' ? 'pr-9' : 'pr-11') : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className={`absolute right-0 top-0 bottom-0 flex items-center justify-center text-[hsl(var(--color-text-muted))] ${size === 'sm' ? 'w-9 text-[14px]' : 'w-11 text-[18px]'}`}>
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
