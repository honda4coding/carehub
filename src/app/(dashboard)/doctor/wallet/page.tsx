"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, Wallet, Transaction, PayoutRequest } from "@/services/walletService";
import { LuWallet, LuHistory, LuArrowDownToLine, LuCheckCircle, LuXCircle, LuClock } from "react-icons/lu";

export default function DoctorWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("instapay");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState("");

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

  const handleRequestPayout = async () => {
    setPayoutError("");
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) return setPayoutError("Invalid amount");
    if (wallet && amount > wallet.availableBalance) return setPayoutError("Amount exceeds available balance");
    if (!payoutDetails) return setPayoutError("Please enter payment details");

    setPayoutSubmitting(true);
    try {
      await walletService.requestPayout({
        amount,
        paymentMethod: payoutMethod,
        paymentDetails: payoutDetails
      });
      setShowPayoutModal(false);
      setPayoutAmount("");
      setPayoutDetails("");
      loadData();
    } catch (err: any) {
      setPayoutError(err.message || "Failed to request payout");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-black text-slate-800 flex items-center gap-2">
              <LuWallet className="text-emerald-600" /> My Wallet
            </h1>
            <p className="text-[14px] text-slate-500 font-medium">Manage your balance and request withdrawals.</p>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl text-[14px] font-bold hover:bg-slate-700 transition-colors shadow-sm"
          >
            <LuArrowDownToLine /> Request Withdrawal
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
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-sm text-white">
                <p className="text-white/80 text-[13px] font-bold uppercase tracking-wider mb-2">Available Balance</p>
                <p className="text-[36px] font-black">{wallet?.availableBalance ?? 0} EGP</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2">Pending Balance</p>
                <p className="text-[36px] font-black text-slate-800">{wallet?.pendingBalance ?? 0} EGP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transactions */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <LuHistory className="text-slate-500" />
                  <h2 className="text-[16px] font-bold text-slate-800">Recent Transactions</h2>
                </div>
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-[14px] font-medium">No transactions found.</div>
                ) : (
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white">
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider">
                          <th className="p-4 font-bold">Date</th>
                          <th className="p-4 font-bold">Type</th>
                          <th className="p-4 font-bold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map(t => (
                          <tr key={t._id} className="text-[14px] font-medium text-slate-700">
                            <td className="p-4 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[12px] font-bold">
                                {t.type.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className={`p-4 font-bold ${t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {t.amount > 0 ? '+' : ''}{t.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payouts */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <LuArrowDownToLine className="text-slate-500" />
                  <h2 className="text-[16px] font-bold text-slate-800">Withdrawal Requests</h2>
                </div>
                {payouts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-[14px] font-medium">No withdrawal requests found.</div>
                ) : (
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white">
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider">
                          <th className="p-4 font-bold">Date</th>
                          <th className="p-4 font-bold">Amount</th>
                          <th className="p-4 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payouts.map(p => (
                          <tr key={p._id} className="text-[14px] font-medium text-slate-700">
                            <td className="p-4 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-bold">{p.amount} EGP</td>
                            <td className="p-4">
                              {p.status === "pending" && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[12px] w-fit"><LuClock/> Pending</span>}
                              {p.status === "paid" && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[12px] w-fit"><LuCheckCircle/> Paid</span>}
                              {p.status === "rejected" && <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-[12px] w-fit"><LuXCircle/> Rejected</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-[18px] font-black text-slate-800 mb-4">Request Withdrawal</h3>
            
            {payoutError && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-[13px] font-bold">{payoutError}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Amount (EGP)</label>
                <input 
                  type="number"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Method</label>
                <select 
                  value={payoutMethod}
                  onChange={e => setPayoutMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="instapay">InstaPay</option>
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Account Details</label>
                <input 
                  type="text"
                  value={payoutDetails}
                  onChange={e => setPayoutDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                  placeholder={payoutMethod === "instapay" ? "InstaPay Address" : "Number / IBAN"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[14px] font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={payoutSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-[14px] font-black hover:bg-emerald-700 disabled:opacity-50"
              >
                {payoutSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
