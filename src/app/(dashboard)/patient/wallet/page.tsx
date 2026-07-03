"use client";

import { useEffect, useState } from "react";
import { Wallet, Transaction, PayoutRequest, walletService } from "@/services/walletService";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function PatientWalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWithdraw, setShowWithdraw] = useState(false);

    // Form states
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState('instapay');
    const [paymentDetails, setPaymentDetails] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [walletData, transData, payoutsData] = await Promise.all([
                walletService.getMyWallet(),
                walletService.getMyTransactions(),
                walletService.getMyPayouts()
            ]);
            setWallet(walletData);
            setTransactions(transData);
            setPayoutRequests(payoutsData);
        } catch (error) {
            toast.error("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || amount <= 0 || !paymentDetails) return;
        if (wallet && Number(amount) > wallet.availableBalance) {
            toast.error("Insufficient balance");
            return;
        }

        try {
            await walletService.requestPayout({
                amount: Number(amount),
                paymentMethod,
                paymentDetails
            });
            toast.success("Withdrawal request submitted");
            setShowWithdraw(false);
            setAmount('');
            setPaymentDetails('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit request");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading wallet data...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <WalletIcon className="text-primary" /> My Wallet
                </h1>
                <button 
                    onClick={() => setShowWithdraw(true)}
                    className="btn btn-primary"
                    disabled={!wallet || wallet.availableBalance <= 0}
                >
                    Withdraw Funds
                </button>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                    <p className="text-primary-foreground/80 font-medium mb-1">Available Balance</p>
                    <h2 className="text-4xl font-bold">{wallet?.availableBalance.toFixed(2) || '0.00'} EGP</h2>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-sm opacity-90 mb-1">Total Refunded</p>
                    <p className="text-xl font-semibold">
                        {transactions.filter(t => t.type === 'refund').reduce((acc, t) => acc + t.amount, 0).toFixed(2)} EGP
                    </p>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdraw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Withdraw Funds</h3>
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
                            <div>
                                <label className="label">Transfer Method</label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="instapay">InstaPay</option>
                                    <option value="vodafone_cash">Vodafone Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Account Details (Number / Handle)</label>
                                <input 
                                    type="text" 
                                    className="input input-bordered w-full" 
                                    value={paymentDetails}
                                    onChange={(e) => setPaymentDetails(e.target.value)}
                                    placeholder="e.g. 010xxxxxxxx or user@instapay"
                                    required
                                />
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
                {/* Transactions Ledger */}
                <div className="bg-base-100 rounded-2xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
                    {transactions.length === 0 ? (
                        <p className="text-base-content/50 text-center py-8">No transactions yet</p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {transactions.map(t => (
                                <div key={t._id} className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${['refund', 'payout_rejected'].includes(t.type) ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                            {['refund', 'payout_rejected'].includes(t.type) ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{t.type.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-base-content/60">{dayjs(t.createdAt).format('MMM D, YYYY h:mm A')}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${['refund', 'payout_rejected'].includes(t.type) ? 'text-success' : 'text-error'}`}>
                                        {['refund', 'payout_rejected'].includes(t.type) ? '+' : '-'}{t.amount.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payout Requests */}
                <div className="bg-base-100 rounded-2xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold mb-4">Withdrawal Requests</h3>
                    {payoutRequests.length === 0 ? (
                        <p className="text-base-content/50 text-center py-8">No requests yet</p>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {payoutRequests.map(req => (
                                <div key={req._id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold">{req.amount.toFixed(2)} EGP</p>
                                        {req.status === 'pending' && <span className="badge badge-warning gap-1"><Clock size={14}/> Pending</span>}
                                        {req.status === 'paid' && <span className="badge badge-success gap-1"><CheckCircle size={14}/> Paid</span>}
                                        {req.status === 'rejected' && <span className="badge badge-error gap-1"><XCircle size={14}/> Rejected</span>}
                                    </div>
                                    <p className="text-sm text-base-content/70 capitalize">{req.paymentMethod.replace(/_/g, ' ')}: {req.paymentDetails}</p>
                                    <p className="text-xs text-base-content/50 mt-2">{dayjs(req.createdAt).format('MMM D, YYYY')}</p>
                                    {req.adminNotes && (
                                        <div className="mt-2 text-xs bg-base-200 p-2 rounded">
                                            <span className="font-semibold">Admin:</span> {req.adminNotes}
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
