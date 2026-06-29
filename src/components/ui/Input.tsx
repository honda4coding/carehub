import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, leftIcon, rightIcon, size = 'lg', ...props }, ref) => {
    const sizeStyles = {
      sm: 'py-2 px-3 text-[11px] rounded-[8px]',
      md: 'py-3 px-4 text-[13px] rounded-xl',
      lg: 'py-4 px-4 rounded-2xl'
    };

    const baseStyles = `w-full ${sizeStyles[size]} outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.6)] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] cursor-text`;
    
    const errorStyles = error 
      ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.05)] focus:ring-4 focus:ring-[hsl(var(--color-danger)/0.1)]' 
      : 'border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]';

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className={`absolute start-0 top-0 bottom-0 flex items-center justify-center text-[hsl(var(--color-text-muted))] ${size === 'sm' ? 'w-8 text-[12px]' : 'w-12 text-[20px]'}`}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${
            leftIcon ? (size === 'sm' ? 'ps-8' : 'ps-12') : ''
          } ${rightIcon ? (size === 'sm' ? 'pe-8' : 'pe-12') : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className={`absolute end-0 top-0 bottom-0 flex items-center justify-center text-[hsl(var(--color-text-muted))] ${size === 'sm' ? 'w-8 text-[12px]' : 'w-12 text-[20px]'}`}>
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
