"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, Wallet, Transaction, PayoutRequest } from "@/services/walletService";
import { LuWallet, LuHistory, LuArrowDownToLine, LuCircleCheck as LuCircleCheck, LuCircleX as LuCircleX, LuClock } from "react-icons/lu";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function PatientWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('instapay');
  const [paymentDetails, setPaymentDetails] = useState('');

  const loadData = async () => {
    try {
      const [myWallet, myTransactions, myPayouts] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getMyTransactions(),
        walletService.getMyPayouts(),
      ]);
      setWallet(myWallet);
      setTransactions(myTransactions);
      setPayouts(myPayouts);
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !paymentDetails) return;
    if (wallet && Number(amount) > wallet.availableBalance) {
        toast.error("Insufficient available balance");
        return;
    }

    try {
        await walletService.requestPayout({
            amount: Number(amount),
            paymentMethod,
            paymentDetails
        });
        toast.success("Payout request submitted successfully");
        setShowWithdraw(false);
        setAmount('');
        setPaymentDetails('');
        loadData();
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-black text-slate-800 flex items-center gap-2">
              <LuWallet className="text-emerald-600" /> My Wallet
            </h1>
            <p className="text-[14px] text-slate-500 font-medium">Manage your balance and withdrawals.</p>
          </div>
          <button 
            onClick={() => setShowWithdraw(true)}
            disabled={!wallet || wallet.availableBalance <= 0}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-[14px] font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-32 bg-slate-200 rounded-2xl w-full" />
            <div className="h-64 bg-slate-200 rounded-2xl w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
                <LuArrowDownToLine className="absolute -right-4 -bottom-4 text-[120px] text-white/10" />
                <p className="text-white/80 text-[13px] font-bold uppercase tracking-wider mb-2 relative z-10">Available Balance</p>
                <p className="text-[36px] font-black relative z-10">{wallet?.availableBalance ?? 0} EGP</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2">Pending Balance</p>
                <p className="text-[36px] font-black text-slate-800">{wallet?.pendingBalance ?? 0} EGP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transactions */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <LuHistory className="text-slate-500" />
                  <h2 className="text-[16px] font-bold text-slate-800">Recent Transactions</h2>
                </div>
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-[14px] font-medium m-auto">No transactions found.</div>
                ) : (
                  <div className="overflow-y-auto flex-1 p-5 space-y-3">
                    {transactions.map(t => (
                      <div key={t._id} className="flex justify-between items-center p-3 border border-slate-100 hover:bg-slate-50 rounded-xl transition-all">
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-bold text-slate-800 capitalize">{t.type.replace(/_/g, ' ')}</span>
                          <span className="text-[12px] text-slate-500">{dayjs(t.createdAt).format('MMM D, YYYY h:mm A')}</span>
                        </div>
                        <div className={`font-black text-[15px] ${t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {t.amount > 0 ? '+' : ''}{t.amount} EGP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payouts */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <LuArrowDownToLine className="text-slate-500" />
                  <h2 className="text-[16px] font-bold text-slate-800">Withdrawal Requests</h2>
                </div>
                {payouts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-[14px] font-medium m-auto">No payout requests found.</div>
                ) : (
                  <div className="overflow-y-auto flex-1 p-5 space-y-3">
                    {payouts.map(req => (
                      <div key={req._id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow bg-slate-50/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-black text-[16px] text-slate-800">{req.amount.toFixed(2)} EGP</p>
                            <p className="text-[11px] font-bold text-slate-400">{dayjs(req.createdAt).format('MMM D, YYYY h:mm A')}</p>
                          </div>
                          {req.status === 'pending' && <span className="flex items-center gap-1 text-[12px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><LuClock/> Pending</span>}
                          {req.status === 'paid' && <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><LuCircleCheck/> Paid</span>}
                          {req.status === 'rejected' && <span className="flex items-center gap-1 text-[12px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md"><LuCircleX/> Rejected</span>}
                        </div>
                        <div className="bg-white border border-slate-100 rounded-lg p-3 text-[12px] font-medium text-slate-600">
                          <p className="mb-1"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Method:</span> {req.paymentMethod.replace(/_/g, ' ')}</p>
                          <p><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Details:</span> {req.paymentDetails}</p>
                        </div>
                        {req.adminNotes && (
                          <div className="mt-3 text-[12px] border-l-2 border-rose-500 pl-3 py-1 bg-rose-50/50 rounded-r-md">
                            <span className="font-bold text-rose-700">Reason:</span> <span className="text-rose-600">{req.adminNotes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <LuArrowDownToLine size={20} />
              </div>
              <h3 className="text-[18px] font-black text-slate-800">Request Payout</h3>
            </div>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1">Amount (EGP)</label>
                <input 
                  type="number" 
                  max={wallet?.availableBalance}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
                <span className="block text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-wide">
                  Max available: {wallet?.availableBalance} EGP
                </span>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1">Payment Method</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="instapay">InstaPay</option>
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1">Account Details</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="e.g. 010xxxxxxxx or user@instapay or IBAN"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" className="px-5 py-2.5 text-slate-500 font-bold text-[14px] hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setShowWithdraw(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-[14px] hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-200">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

