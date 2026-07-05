import React, { useState } from "react";
import { LuArrowUpToLine } from "react-icons/lu";
import { walletService } from "@/services/walletService";
import toast from "react-hot-toast";

interface ManualWalletAdjustmentFormProps {
  onSuccess: () => void;
}

export default function ManualWalletAdjustmentForm({ onSuccess }: ManualWalletAdjustmentFormProps) {
  const [targetUserId, setTargetUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [balanceType, setBalanceType] = useState("available");
  const [submitting, setSubmitting] = useState(false);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !amount || !reason) return;

    setSubmitting(true);
    try {
      await walletService.manualWalletAdjust({
        targetUserId,
        amount: Number(amount),
        reason,
        balanceType
      });
      toast.success("Wallet adjusted successfully");
      setTargetUserId("");
      setAmount("");
      setReason("");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-[hsl(var(--color-border))] flex items-center gap-2">
        <LuArrowUpToLine className="text-[hsl(var(--color-text-muted))]" />
        <h2 className="text-[16px] font-bold text-[hsl(var(--color-text))]">Manual Wallet Adjustment</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleAdjust} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">User ID</label>
            <input 
              type="text"
              required
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              placeholder="Paste Object ID"
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Amount (EGP)</label>
            <input 
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="-50 for debit"
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Balance</label>
            <select
              value={balanceType}
              onChange={e => setBalanceType(e.target.value)}
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            >
              <option value="available">Available (Patient/Doc)</option>
              <option value="pending">Pending (Doc only)</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Reason</label>
            <input 
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Refund"
              className="w-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text))]"
            />
          </div>
          <div className="lg:col-span-1">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] rounded-xl px-4 py-2.5 text-[14px] font-bold hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-50 h-[42px]"
            >
              {submitting ? "Processing..." : "Apply Adjust"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
