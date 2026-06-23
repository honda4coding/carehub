"use client";

import { useState } from "react";
import { LuCreditCard, LuCheck } from "react-icons/lu";

export default function PayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-sm overflow-hidden border border-[hsl(var(--color-border))]">
        <div className="bg-[hsl(var(--color-primary))] px-6 py-5 text-white text-center">
          <LuCreditCard className="text-[32px] mx-auto mb-2" />
          <p className="text-[18px] font-black">Pay for Appointment</p>
          <p className="text-[13px] opacity-80 mt-1">Secure payment — temporary placeholder</p>
        </div>
        <div className="p-6 space-y-4">
          {paid ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--color-success-bg))] flex items-center justify-center mx-auto mb-3">
                <LuCheck className="text-[hsl(var(--color-success))] text-[28px]" />
              </div>
              <p className="text-[15px] font-black text-[hsl(var(--color-text))]">Payment successful!</p>
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-1">
                This is a placeholder — no real charge was made.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-4 border border-[hsl(var(--color-border))]">
                <div className="flex justify-between text-[14px] font-semibold text-[hsl(var(--color-text-muted))] mb-1">
                  <span>Consultation fee</span>
                  <span className="text-[hsl(var(--color-text))] font-black">EGP 350</span>
                </div>
                <div className="flex justify-between text-[13px] text-[hsl(var(--color-text-muted))]">
                  <span>Platform fee</span>
                  <span>EGP 20</span>
                </div>
                <div className="border-t border-[hsl(var(--color-border))] mt-3 pt-3 flex justify-between text-[16px] font-black text-[hsl(var(--color-text))]">
                  <span>Total</span>
                  <span className="text-[hsl(var(--color-primary))]">EGP 370</span>
                </div>
              </div>
              <button
                onClick={() => setPaid(true)}
                className="w-full cursor-pointer py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[16px] font-black hover:opacity-90 transition-all"
              >
                Pay Now
              </button>
            </>
          )}
          <button
            onClick={() => {
              setPaid(false);
              onClose();
            }}
            className="w-full cursor-pointer py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            {paid ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
