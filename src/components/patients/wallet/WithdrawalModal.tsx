"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { walletService, Wallet, PayoutProfile } from "@/services/walletService";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  payoutMethods: any[];
  profile: PayoutProfile | null;
  onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, wallet, payoutMethods, profile, onSuccess }: WithdrawalModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedMethodId, setSelectedMethodId] = useState(payoutMethods.length > 0 ? payoutMethods[0]._id : "");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("Invalid amount");
    if (wallet && Number(amount) > wallet.availableBalance) {
        toast.error("Insufficient available balance");
        return;
    }

    setPayoutSubmitting(true);
    try {
        await walletService.requestPayout({
            amount: Number(amount),
            selectedMethodId
        });
        toast.success("Payout request submitted successfully");
        setAmount('');
        onSuccess();
        onClose();
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
        setPayoutSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--color-bg-base)/0.6)] backdrop-blur-md p-4 animate-in fade-in duration-200">
      <form onSubmit={handleWithdraw} className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl p-6 w-full max-w-sm shadow-[var(--shadow-xl)] animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold tracking-tight text-[hsl(var(--color-text))] mb-4">Request Withdrawal</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-widest">Select Payout Destination</label>
            {payoutMethods.length > 0 ? (
              <select 
                value={selectedMethodId}
                onChange={e => setSelectedMethodId(e.target.value)}
                className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold text-[hsl(var(--color-text))]"
              >
                {payoutMethods.map(method => (
                  <option key={method._id} value={method._id}>
                    {method.methodType.replace(/_/g, ' ')} - {method.accountDetails}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl font-bold text-[hsl(var(--color-text-muted))]">
                {profile?.paymentMethod?.replace(/_/g, ' ')} - {profile?.accountDetails}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-widest">Amount to Withdraw (EGP)</label>
            <input 
              type="number"
              required
              min="1"
              max={wallet?.availableBalance || 0}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold text-[hsl(var(--color-text))]"
              placeholder="0.00"
            />
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1.5 font-medium">Max available: {wallet?.availableBalance || 0} EGP</p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[hsl(var(--color-border-soft))] text-sm font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={payoutSubmitting}
            className="flex-1 py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white text-sm font-bold tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px"
          >
            {payoutSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
