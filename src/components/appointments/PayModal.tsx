"use client";

import { useState, useEffect } from "react";
import { LuCreditCard, LuCheck, LuLoader, LuWallet } from "react-icons/lu";
import { fetchClient } from "@/services/fetchClient";
import { walletService } from "@/services/walletService";

export default function PayModal({
  open,
  onClose,
  appointmentId,
}: {
  open: boolean;
  onClose: () => void;
  appointmentId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (open) {
      walletService.getMyWallet().then(data => {
        if (data && data.availableBalance) {
          setWalletBalance(data.availableBalance);
        }
      }).catch(err => console.error("Wallet fetch error", err));
    }
  }, [open]);

  if (!open) return null;

  const handlePay = async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchClient.post("/payments/checkout", {
        purpose: "appointment",
        referenceId: appointmentId,
        paymentMethod: "card",
      });
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const handlePayWithWallet = async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      await fetchClient.post("/payments/checkout-wallet", {
        purpose: "appointment",
        referenceId: appointmentId,
      });
      window.location.reload(); // Success! Reload to update UI
    } catch (err: any) {
      console.error("Wallet payment error:", err);
      setError(err.response?.data?.message || err.message || "Failed to pay via wallet");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-sm overflow-hidden border border-[hsl(var(--color-border))]">
        <div className="bg-[hsl(var(--color-primary))] px-6 py-5 text-white text-center">
          <LuCreditCard className="text-[32px] mx-auto mb-2" />
          <p className="text-[18px] font-black">Pay for Appointment</p>
          <p className="text-[13px] opacity-80 mt-1">Secure payment options</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-4 border border-[hsl(var(--color-border))]">
            <div className="flex justify-between text-[14px] font-semibold text-[hsl(var(--color-text-muted))] mb-1">
              <span>Consultation fee</span>
              <span className="text-[hsl(var(--color-text))] font-black">--</span>
            </div>
            <div className="border-t border-[hsl(var(--color-border))] mt-3 pt-3 flex justify-between items-center text-[16px] font-black text-[hsl(var(--color-text))]">
              <span>Your Wallet Balance</span>
              <span className="text-[hsl(var(--color-primary))]">{walletBalance.toFixed(2)} EGP</span>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 cursor-pointer py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[16px] font-black hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? <LuLoader className="animate-spin text-lg" /> : "Proceed to Payment (Card)"}
              </button>
              
              {walletBalance > 0 && (
                  <button
                    onClick={handlePayWithWallet}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer py-3 rounded-xl bg-[hsl(var(--color-success))] text-white text-[16px] font-black hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {loading ? <LuLoader className="animate-spin text-lg" /> : <><LuWallet /> Pay with Wallet Balance</>}
                  </button>
              )}
          </div>
          
          <button
            onClick={() => {
              if (!loading) onClose();
            }}
            disabled={loading}
            className="w-full cursor-pointer py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
