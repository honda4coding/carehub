import React from "react";

interface RejectDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (val: string) => void;
  isLoading: boolean;
}

export default function RejectDoctorModal({
  isOpen,
  onClose,
  onConfirm,
  reason,
  setReason,
  isLoading,
}: RejectDoctorModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-[90vw] max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[14px] font-black text-[hsl(var(--color-text))] mb-1">
          Reject Doctor
        </h2>
        <p className="text-[11px] text-[hsl(var(--color-text-muted))] mb-4">
          Please provide a reason for rejection.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          rows={4}
          className="w-full px-3 py-2.5 text-[12px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-danger)/0.5)] transition-colors resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 text-[11px] font-bold py-2 rounded-[9px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || isLoading}
            className="flex-1 text-[11px] font-bold py-2 rounded-[9px] bg-[hsl(var(--color-danger))] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
