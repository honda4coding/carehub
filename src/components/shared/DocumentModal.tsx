import React from 'react';
import { Modal } from '@/components/ui/Modal';

interface DocumentModalProps {
  url: string | null;
  onClose: () => void;
  title?: string;
}

export function DocumentModal({ url, onClose, title = "Document Viewer" }: DocumentModalProps) {
  if (!url) return null;

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <Modal
      isOpen={!!url}
      onClose={onClose}
      title={title}
      maxWidth="4xl"
    >
      <div className="w-full h-[70vh] bg-[hsl(var(--color-bg))] relative overflow-hidden flex items-center justify-center rounded-b-[20px]">
        {isPdf ? (
          <iframe 
            src={url} 
            className="w-full h-full border-0"
            title={title}
          />
        ) : (
          <img 
            src={url} 
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>
    </Modal>
  );
}
