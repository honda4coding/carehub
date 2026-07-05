"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService } from "@/services/walletService";
import { LuWallet, LuTrendingUp, LuArrowDownToLine, LuArrowUpToLine, LuHistory, LuSearch } from "react-icons/lu";
import toast from "react-hot-toast";

export default function AdminFinancePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment State
  const [targetUserId, setTargetUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [balanceType, setBalanceType] = useState("available");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      // Call the newly created walletService.getWalletStats()
      // Note: We need to implement this in the frontend walletService first, assuming it exists or we use fetch.
      const data = await walletService.getWalletStats();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader title="Finance & Ledger" subtitle="Monitor platform revenue and manage wallets" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-black text-slate-800 flex items-center gap-2">
            <LuWallet className="text-emerald-600" /> Platform Ledger
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">Global financial overview and support adjustments.</p>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-32 bg-slate-200 rounded-2xl w-full" />
            <div className="h-64 bg-slate-200 rounded-2xl w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
                <LuTrendingUp className="absolute -right-4 -bottom-4 text-[120px] text-white/10" />
                <p className="text-white/80 text-[13px] font-bold uppercase tracking-wider mb-2 relative z-10">Total Platform Revenue</p>
                <p className="text-[36px] font-black relative z-10">{stats?.totalRevenue ?? 0} <span className="text-indigo-200 text-lg">EGP</span></p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2">Global Liabilities (Available)</p>
                <p className="text-[36px] font-black text-slate-800">{stats?.totalAvailable ?? 0} <span className="text-slate-400 text-lg">EGP</span></p>
                <p className="text-[12px] text-slate-400 font-medium">Total funds available to be withdrawn</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2">Global Liabilities (Pending)</p>
                <p className="text-[36px] font-black text-slate-800">{stats?.totalPending ?? 0} <span className="text-slate-400 text-lg">EGP</span></p>
                <p className="text-[12px] text-slate-400 font-medium">Funds locked in upcoming appointments</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <LuArrowUpToLine className="text-slate-500" />
                  <h2 className="text-[16px] font-bold text-slate-800">Manual Wallet Adjustment</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleAdjust} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-1">
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">User ID</label>
                            <input 
                                type="text"
                                required
                                value={targetUserId}
                                onChange={e => setTargetUserId(e.target.value)}
                                placeholder="Paste Object ID"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (EGP)</label>
                            <input 
                                type="number"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="-50 for debit"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Balance</label>
                            <select
                                value={balanceType}
                                onChange={e => setBalanceType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-emerald-500 outline-none"
                            >
                                <option value="available">Available (Patient/Doc)</option>
                                <option value="pending">Pending (Doc only)</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
                            <input 
                                type="text"
                                required
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="e.g. Refund"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-[14px] font-bold hover:bg-emerald-700 disabled:opacity-50 h-[42px]"
                            >
                                {submitting ? "Processing..." : "Apply Adjust"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
