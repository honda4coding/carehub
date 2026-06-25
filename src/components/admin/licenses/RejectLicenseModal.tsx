"use client";

import { useState } from "react";
import { LuShieldX } from "react-icons/lu";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
}

export default function RejectLicenseModal({ isOpen, onClose, onConfirm, isLoading }: Props) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  if (!isOpen) return null;

  const trimmed = reason.trim();
  const error =
    trimmed.length === 0
      ? "Rejection reason is required"
      : trimmed.length < 5
      ? "Reason must be at least 5 characters"
      : "";

  const handleConfirm = async () => {
    if (error) {
      setTouched(true);
      return;
    }
    await onConfirm(trimmed);
    setReason("");
    setTouched(false);
  };

  const handleClose = () => {
    setReason("");
    setTouched(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-[90vw] max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--color-danger-bg))] flex items-center justify-center shrink-0">
            <LuShieldX className="w-4 h-4 text-[hsl(var(--color-danger))]" />
          </div>
          <div>
            <h2 className="text-[14px] font-black text-[hsl(var(--color-text))]">Reject License</h2>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))]">
              The doctor will be notified with your reason.
            </p>
          </div>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Enter the reason this license was rejected..."
          rows={4}
          className={`w-full px-3 py-2.5 text-[12px] font-medium rounded-[10px] border bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] outline-none transition-colors resize-none ${
            touched && error
              ? "border-[hsl(var(--color-danger))] focus:border-[hsl(var(--color-danger))]"
              : "border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-danger)/0.5)]"
          }`}
        />
        {touched && error && (
          <p className="text-[11px] font-semibold text-[hsl(var(--color-danger))] mt-1.5">
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 text-[12px] font-bold py-2.5 rounded-[10px] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !!error}
            className="flex-1 text-[12px] font-bold py-2.5 rounded-[10px] bg-[hsl(var(--color-danger))] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}