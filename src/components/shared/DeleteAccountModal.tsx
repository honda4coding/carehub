"use client";

import { useState } from "react";
import { LuTrash2, LuX } from "react-icons/lu";
import { ImSpinner2 } from "react-icons/im";

interface Props {
  onConfirm: () => Promise<void>;
}

export default function DeleteAccountModal({ onConfirm }: Props) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await onConfirm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-[13px] font-bold px-4 py-2.5 rounded-xl bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] hover:opacity-80 transition-opacity"
      >
        <LuTrash2 className="w-4 h-4" />
        Delete Account
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl shadow-xl w-full max-w-sm p-6 border border-[hsl(var(--color-border))]">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-danger-bg))] flex items-center justify-center">
                <LuTrash2 className="w-5 h-5 text-[hsl(var(--color-danger))]" />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[hsl(var(--color-text-muted))] hover:opacity-70 transition-opacity"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-[15px] font-black text-[hsl(var(--color-text))] mb-1">
              Delete Account
            </h3>
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] mb-5">
              This action is permanent and cannot be undone. All your data will be deleted.
            </p>

            {error && (
              <p className="text-danger text-xs font-medium mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-[hsl(var(--color-danger))] text-white hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><ImSpinner2 className="w-4 h-4 animate-spin" /> Deleting...</>
                  : "Yes, Delete"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}