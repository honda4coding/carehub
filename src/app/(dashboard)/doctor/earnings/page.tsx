"use client";

import { useEffect, useState } from "react";
import { Wallet, Transaction, PayoutRequest, walletService } from "@/services/walletService";
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function DoctorEarningsPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWithdraw, setShowWithdraw] = useState(false);

    // Form states
    const [amount, setAmount] = useState<number | ''>('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [walletData, transData, payoutsData] = await Promise.all([
                walletService.getMyWallet(),
                walletService.getMyTransactions(),
                walletService.getMyPayouts()
            ]);
            setWallet(walletData);
            setTransactions(transData.transactions || []);
            setPayoutRequests(payoutsData.payouts || []);
        } catch (error) {
            toast.error("Failed to load earnings data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || amount <= 0) return;
        if (wallet && Number(amount) > wallet.availableBalance) {
            toast.error("Insufficient available balance");
            return;
        }

        try {
            await walletService.requestPayout({
                amount: Number(amount)
            });
            toast.success("Payout request submitted successfully");
            setShowWithdraw(false);
            setAmount('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit request");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading earnings data...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <DollarSign className="text-primary" /> Earnings & Payouts
                </h1>
                <button 
                    onClick={() => setShowWithdraw(true)}
                    className="btn btn-primary"
                    disabled={!wallet || wallet.availableBalance <= 0}
                >
                    Request Payout
                </button>
            </div>

            {/* Balances Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-xl">
                    <p className="text-primary-foreground/80 font-medium mb-2">Available Balance (Ready to Withdraw)</p>
                    <h2 className="text-4xl font-bold">{wallet?.availableBalance.toFixed(2) || '0.00'} EGP</h2>
                    <p className="text-sm mt-4 opacity-90">Unlocked after sessions are completed.</p>
                </div>
                
                <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-warning/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={100} />
                    </div>
                    <p className="text-base-content/70 font-medium mb-2 relative z-10">Pending Balance (Locked)</p>
                    <h2 className="text-4xl font-bold text-warning relative z-10">{wallet?.pendingBalance.toFixed(2) || '0.00'} EGP</h2>
                    <p className="text-sm mt-4 text-base-content/60 relative z-10">Currently locked in booked appointments. Will be available once you mark the session as complete.</p>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdraw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Request Payout</h3>
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <label className="label">Amount (EGP)</label>
                                <input 
                                    type="number" 
                                    max={wallet?.availableBalance}
                                    className="input input-bordered w-full" 
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    required
                                />
                                <span className="text-xs text-base-content/60 mt-1">Max available: {wallet?.availableBalance} EGP</span>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowWithdraw(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Earnings Ledger */}
                <div className="bg-base-100 rounded-2xl shadow-sm border p-6 flex flex-col h-[500px]">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Earnings Ledger</h3>
                    {transactions.length === 0 ? (
                        <p className="text-base-content/50 text-center m-auto">No earnings yet</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                            {transactions.map(t => (
                                <div key={t._id} className="flex justify-between items-center p-3 border border-base-200 hover:bg-base-50 rounded-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${['payout_withdrawal', 'refund'].includes(t.type) ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                                            {['payout_withdrawal', 'refund'].includes(t.type) ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm capitalize">{t.type.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-base-content/50">{dayjs(t.createdAt).format('MMM D, YYYY h:mm A')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${['payout_withdrawal', 'refund'].includes(t.type) ? 'text-error' : 'text-success'}`}>
                                            {['payout_withdrawal', 'refund'].includes(t.type) ? '-' : '+'}{t.amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payout Requests History */}
                <div className="bg-base-100 rounded-2xl shadow-sm border p-6 flex flex-col h-[500px]">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Payout Requests</h3>
                    {payoutRequests.length === 0 ? (
                        <p className="text-base-content/50 text-center m-auto">No payout requests</p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                            {payoutRequests.map(req => (
                                <div key={req._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-lg">{req.amount.toFixed(2)} EGP</p>
                                            <p className="text-xs text-base-content/50">{dayjs(req.createdAt).format('MMM D, YYYY h:mm A')}</p>
                                        </div>
                                        {req.status === 'pending' && <span className="badge badge-warning gap-1 py-3"><Clock size={14}/> Pending</span>}
                                        {req.status === 'paid' && <span className="badge badge-success gap-1 py-3 text-white"><CheckCircle size={14}/> Paid</span>}
                                        {req.status === 'rejected' && <span className="badge badge-error gap-1 py-3 text-white"><XCircle size={14}/> Rejected</span>}
                                    </div>
                                    <div className="bg-base-200 rounded-lg p-3 text-sm">
                                        <p className="capitalize"><span className="text-base-content/60">Method:</span> {req.paymentMethod.replace(/_/g, ' ')}</p>
                                        <p><span className="text-base-content/60">Details:</span> {req.paymentDetails}</p>
                                    </div>
                                    {req.adminNotes && (
                                        <div className="mt-3 text-sm border-l-4 border-error pl-3">
                                            <span className="font-semibold text-error">Admin Reason:</span> {req.adminNotes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
