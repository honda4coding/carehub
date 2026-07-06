import React, { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md'
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div 
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[hsl(var(--color-bg-surface))] rounded-[20px] shadow-[var(--shadow-modal)] border border-[hsl(var(--color-border))] overflow-hidden flex flex-col max-h-[90vh] animate-slide-up`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 border-b border-[hsl(var(--color-border-soft))]">
            <div>
              {title && <h2 id="modal-title" className="text-xl font-semibold text-[hsl(var(--color-text))] tracking-tight">{title}</h2>}
              {description && <p className="mt-1 text-sm text-[hsl(var(--color-text-muted))]">{description}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              icon={LuX}
              onClick={onClose}
              className="-mt-1 -mr-2"
              aria-label="Close modal"
            />
          </div>
        )}
        
        {/* If no header, just a close button absolutely positioned */}
        {!title && !description && (
          <Button
            variant="ghost"
            size="icon"
            icon={LuX}
            onClick={onClose}
            className="absolute top-4 right-4 z-10"
            aria-label="Close modal"
          />
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end p-5 sm:p-6 border-t border-[hsl(var(--color-border-soft))] bg-[hsl(var(--color-bg-soft))] gap-3 rounded-b-[20px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
