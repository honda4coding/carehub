import React, { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = '', children, ...props }) => {
  return (
    <label 
      className={`block text-xs font-bold ps-1 mb-1.5 uppercase tracking-wide text-[hsl(var(--color-text-muted))] ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
