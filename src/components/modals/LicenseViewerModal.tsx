"use client";
import Image from "next/image";

interface LicenseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
}

export default function LicenseViewerModal({ isOpen, onClose, fileUrl }: LicenseViewerModalProps) {
  if (!isOpen || !fileUrl) return null;

  const isPdf = fileUrl.endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-[90vw] max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--color-border))]">
          <p className="text-[13px] font-black text-[hsl(var(--color-text))]">License Document</p>
          <button
            onClick={onClose}
            className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isPdf ? (
            <iframe src={fileUrl} className="w-full h-[65vh] rounded-lg border border-[hsl(var(--color-border))]" />
          ) : (
            <Image src={fileUrl} alt="License" width={800} height={600} className="w-full rounded-lg object-contain max-h-[65vh]" />
          )}
        </div>
      </div>
    </div>
  );
}