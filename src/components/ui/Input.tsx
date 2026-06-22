import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, leftIcon, rightIcon, ...props }, ref) => {
    const baseStyles = 'w-full py-4 rounded-2xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.6)] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] cursor-text shadow-sm shadow-black/5';
    
    const errorStyles = error 
      ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.05)] focus:ring-4 focus:ring-[hsl(var(--color-danger)/0.1)]' 
      : 'border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]';

    let paddingStyles = 'px-4';
    if (leftIcon && rightIcon) paddingStyles = 'pl-12 pr-12';
    else if (leftIcon) paddingStyles = 'pl-12 pr-4';
    else if (rightIcon) paddingStyles = 'pl-4 pr-12';

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${paddingStyles} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
