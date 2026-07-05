"use client";

import { useEffect, useState, useRef } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, Wallet, Transaction, PayoutRequest, PayoutProfile } from "@/services/walletService";
import { LuWallet, LuHistory, LuArrowDownToLine, LuCircleCheck, LuCircleX, LuClock, LuLock, LuImage } from "react-icons/lu";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function PatientWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactionsData, setTransactionsData] = useState<{ transactions: Transaction[], pagination: any }>({ transactions: [], pagination: null });
  const [payoutsData, setPayoutsData] = useState<{ payouts: PayoutRequest[], pagination: any }>({ payouts: [], pagination: null });
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);

  // Pagination states
  const [txPage, setTxPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [profile, setProfile] = useState<PayoutProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Setup / Change form state
  const [setupMethod, setSetupMethod] = useState("instapay");
  const [setupDetails, setSetupDetails] = useState("");
  const [setupPhoto, setSetupPhoto] = useState<File | null>(null);
  const [setupPreview, setSetupPreview] = useState<string | null>(null);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payout Request state
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [myWallet, myTransactions, myPayouts, myProfile, myMethods] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getMyTransactions(txPage, 10),
        walletService.getMyPayouts(payoutPage, 10),
        walletService.getMyPayoutProfile(),
        walletService.getMyPayoutMethods()
      ]);
      setWallet(myWallet);
      setTransactionsData(myTransactions);
      setPayoutsData(myPayouts);
      setProfile(myProfile);
      setPayoutMethods(myMethods);
      if (myMethods.length > 0) {
        setSelectedMethodId(myMethods[0]._id);
      }
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [txPage, payoutPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSetupPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setSetupPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSetupSubmit = async () => {
    if (!setupDetails) return toast.error("Please enter your account details");
    if (!setupPhoto) return toast.error("Please upload a photo of yourself with your ID");

    setSetupSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", setupMethod);
      formData.append("accountDetails", setupDetails);
      formData.append("idPhoto", setupPhoto);

      await walletService.setupPayoutProfile(formData);
      await loadData();
      toast.success("Wallet unlocked successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to setup profile");
    } finally {
      setSetupSubmitting(false);
    }
  };

  const handleChangeRequestSubmit = async () => {
    if (!setupDetails) return toast.error("Please enter your new account details");
    if (!setupPhoto) return toast.error("Please upload a photo of yourself with your ID");

    setSetupSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("newPaymentMethod", setupMethod);
      formData.append("newAccountDetails", setupDetails);
      formData.append("idPhoto", setupPhoto);

      await walletService.requestPayoutChange(formData);
      setShowChangeModal(false);
      setSetupPhoto(null);
      setSetupPreview(null);
      setSetupDetails("");
      toast.success("Change request submitted. An admin will review it.");
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to request change");
    } finally {
      setSetupSubmitting(false);
    }
  };

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
        setShowWithdraw(false);
        setAmount('');
        loadData();
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
        setPayoutSubmitting(false);
    }
  };

  const renderTransactionType = (type: string) => {
    switch (type) {
        case 'online_booking_payment': return 'Appointment Payment';
        case 'payout_withdrawal': return 'Withdrawal';
        case 'refund': return 'Refund';
        case 'cancellation_fee': return 'Cancellation Fee';
        default: return type.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] p-8 animate-pulse"><div className="h-32 bg-slate-200 rounded-2xl w-full max-w-5xl mx-auto" /></div>;
  }

  // SHOW FULL SCREEN WIZARD IF NOT SETUP
  if (profile && !profile.isSetup) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-slate-900 justify-center items-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
            <LuLock className="text-emerald-600 text-3xl" />
          </div>
          <h1 className="text-[24px] font-black text-slate-800 mb-2">Secure Payout Setup</h1>
          <p className="text-[14px] text-slate-500 font-medium mb-8">
            Before using your wallet for withdrawals, you must securely setup your payout details. These details will be locked to prevent unauthorized withdrawals.
          </p>

          {profile.hasPendingRequest ? (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center">
              <LuClock className="text-amber-500 text-4xl mx-auto mb-3" />
              <h3 className="text-[16px] font-black text-amber-900 mb-2">Verification Pending</h3>
              <p className="text-[14px] text-amber-700 font-medium">
                Your payout profile setup is currently being reviewed by our administration team. You will be able to access your wallet once approved.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
            {profile.lastRejectedReason && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-[13px] font-bold">
                <p className="flex items-center gap-2 mb-1"><LuCircleX className="text-rose-600 text-lg" /> Previous Request Rejected</p>
                <p className="font-medium text-rose-600 pl-6">{profile.lastRejectedReason}</p>
              </div>
            )}
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Payment Method</label>
              <select 
                value={setupMethod}
                onChange={e => setSetupMethod(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 transition-all"
              >
                <option value="instapay">InstaPay</option>
                <option value="vodafone_cash">Vodafone Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Account Details</label>
              <input 
                type="text"
                value={setupDetails}
                onChange={e => setSetupDetails(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-800 transition-all"
                placeholder={setupMethod === "instapay" ? "e.g., user@instapay" : "Phone / IBAN"}
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Identity Verification (Selfie with ID)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all relative overflow-hidden"
              >
                {setupPreview ? (
                  <img src={setupPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <LuImage className="text-slate-400 text-4xl mb-3" />
                    <p className="text-[13px] font-bold text-slate-600 text-center">Click to upload a clear photo of your face holding your National ID next to it.</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <button
              onClick={handleSetupSubmit}
              disabled={setupSubmitting}
              className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-[15px] font-black transition-all shadow-md shadow-emerald-600/20"
            >
              {setupSubmitting ? "Securing Profile..." : "Complete Setup & Unlock Wallet"}
            </button>
          </div>
          )}
        </div>
      </div>
    );
  }

  // NORMAL WALLET VIEW
  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader title="My Wallet" subtitle="Manage your balance and withdrawals" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-black text-slate-800 flex items-center gap-2">
              <LuWallet className="text-emerald-600" /> My Wallet
            </h1>
          </div>
          <button 
            onClick={() => setShowWithdraw(true)}
            disabled={!wallet || wallet.availableBalance <= 0 || profile?.isSuspended}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-[14px] font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Withdrawal
          </button>
        </div>

        {profile?.isSuspended && (
          <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-700 shadow-sm">
            <LuLock className="mt-1 shrink-0 text-xl" />
            <div className="flex flex-col">
              <span className="text-[14px] font-black uppercase">Wallet Suspended</span>
              <span className="text-[13px] font-medium mt-1">{profile.suspendReason || "Your wallet has been suspended by an administrator."}</span>
            </div>
          </div>
        )}

        {/* PAYOUT METHODS CARDS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-slate-800">Approved Payment Methods</h3>
            <button 
              onClick={() => setShowChangeModal(true)}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[13px] font-bold hover:bg-emerald-100 transition-colors"
            >
              + Add New Method
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payoutMethods.length > 0 ? (
              payoutMethods.map(method => (
                <div key={method._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">
                      {method.methodType.replace(/_/g, ' ')}
                    </p>
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <LuLock />
                    </div>
                  </div>
                  <p className="text-[15px] font-black text-slate-800">{method.accountDetails}</p>
                </div>
              ))
            ) : profile?.paymentMethod ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">
                    {profile.paymentMethod.replace(/_/g, ' ')}
                  </p>
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <LuLock />
                  </div>
                </div>
                <p className="text-[15px] font-black text-slate-800">{profile.accountDetails}</p>
              </div>
            ) : (
              <p className="text-slate-500 text-sm font-medium">No approved payment methods yet.</p>
            )}
          </div>
        </div>

        {/* BALANCE */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-md mx-auto">
            <p className="text-slate-500 text-[13px] font-bold uppercase tracking-wider mb-2">Available Balance</p>
            <p className="text-[48px] font-black text-emerald-600">EGP {wallet?.availableBalance ?? 0}</p>
            <p className="text-[14px] text-slate-400 font-medium mt-2">Available for withdrawal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TRANSACTIONS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <LuHistory className="text-slate-500" />
                    <h2 className="text-[16px] font-bold text-slate-800">Recent Transactions</h2>
                </div>
            {transactionsData.transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-[14px] font-medium">No transactions found.</div>
                ) : (
                    <div className="flex flex-col h-[400px]">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white">
                                <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider">
                                    <th className="p-4 font-bold">Date</th>
                                    <th className="p-4 font-bold">Type</th>
                                    <th className="p-4 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                    {transactionsData.transactions.map(t => {
                                        const isCredit = t.type === 'credit';
                                        return (
                                            <tr key={t._id} className="text-[14px] font-medium text-slate-700">
                                                <td className="p-4 whitespace-nowrap">{dayjs(t.createdAt).format('DD MMM, YYYY')}</td>
                                                <td className="p-4 font-semibold text-slate-600">{t.type.replace(/_/g, ' ')}</td>
                                                <td className={`p-4 font-bold text-right ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isCredit ? '+' : '-'}{t.amount}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {transactionsData.pagination && transactionsData.pagination.totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 mt-auto">
                                <button 
                                    disabled={txPage === 1} 
                                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded text-[12px] font-bold disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-[12px] font-medium text-slate-500">Page {txPage} of {transactionsData.pagination.totalPages}</span>
                                <button 
                                    disabled={txPage === transactionsData.pagination.totalPages} 
                                    onClick={() => setTxPage(p => p + 1)}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded text-[12px] font-bold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* PAYOUTS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <LuArrowDownToLine className="text-slate-500" />
                    <h2 className="text-[16px] font-bold text-slate-800">Withdrawal Requests</h2>
                </div>
                {payoutsData.payouts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-[14px] font-medium flex-1 flex items-center justify-center">No withdrawal requests found.</div>
                ) : (
                    <div className="flex flex-col flex-1 h-[400px]">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white">
                                <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider">
                                    <th className="p-4 font-bold">Date</th>
                                    <th className="p-4 font-bold">Amount</th>
                                    <th className="p-4 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                    {payoutsData.payouts.map(p => (
                                        <tr key={p._id} className="text-[14px] font-medium text-slate-700">
                                            <td className="p-4 whitespace-nowrap">{dayjs(p.createdAt).format('DD MMM, YYYY')}</td>
                                            <td className="p-4 font-bold">{p.amount} EGP</td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    {p.status === "pending" && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[12px] w-fit font-bold"><LuClock/> Pending</span>}
                                                    {p.status === "paid" && (
                                                        <>
                                                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[12px] w-fit font-bold"><LuCircleCheck/> Paid</span>
                                                            {p.receiptPhoto?.secure_url && (
                                                                <button 
                                                                    onClick={() => window.open(p.receiptPhoto!.secure_url, '_blank')}
                                                                    className="text-[11px] font-bold text-emerald-600 hover:underline text-left w-fit"
                                                                >
                                                                    View Receipt
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {p.status === "rejected" && (
                                                        <>
                                                            <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-[12px] w-fit font-bold"><LuCircleX/> Rejected</span>
                                                            {p.adminNotes && (
                                                                <span className="text-[11px] text-rose-600 font-medium max-w-[150px] leading-tight">
                                                                    {p.adminNotes}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {payoutsData.pagination && payoutsData.pagination.totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 mt-auto">
                                <button 
                                    disabled={payoutPage === 1} 
                                    onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded text-[12px] font-bold disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-[12px] font-medium text-slate-500">Page {payoutPage} of {payoutsData.pagination.totalPages}</span>
                                <button 
                                    disabled={payoutPage === payoutsData.pagination.totalPages} 
                                    onClick={() => setPayoutPage(p => p + 1)}
                                    className="px-3 py-1 bg-white border border-slate-200 rounded text-[12px] font-bold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <form onSubmit={handleWithdraw} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95">
                  <h3 className="text-[18px] font-black text-slate-800 mb-4">Request Withdrawal</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Select Payout Destination</label>
                      {payoutMethods.length > 0 ? (
                        <select 
                          value={selectedMethodId}
                          onChange={e => setSelectedMethodId(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                        >
                          {payoutMethods.map(method => (
                            <option key={method._id} value={method._id}>
                              {method.methodType.replace(/_/g, ' ')} - {method.accountDetails}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-500">
                          {profile?.paymentMethod?.replace(/_/g, ' ')} - {profile?.accountDetails}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Amount to Withdraw (EGP)</label>
                          <input 
                              type="number"
                              required
                              min="1"
                              max={wallet?.availableBalance || 0}
                              value={amount}
                              onChange={e => setAmount(Number(e.target.value))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                              placeholder="0.00"
                          />
                          <p className="text-[12px] text-slate-400 mt-1.5 font-medium">Max available: {wallet?.availableBalance || 0} EGP</p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button
                          type="button"
                          onClick={() => setShowWithdraw(false)}
                          className="flex-1 py-3 rounded-xl border border-slate-200 text-[14px] font-bold text-slate-500 hover:bg-slate-50"
                      >
                          Cancel
                      </button>
                      <button
                          type="submit"
                          disabled={payoutSubmitting}
                          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-[14px] font-black hover:bg-emerald-700 disabled:opacity-50"
                      >
                          {payoutSubmitting ? "Submitting..." : "Submit"}
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* CHANGE REQUEST MODAL */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[20px] font-black text-slate-800 mb-2">Request Payout Change</h3>
            <p className="text-[13px] text-slate-500 font-medium mb-6">
              For security, changing your payout destination requires admin approval.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">New Payment Method</label>
                <select 
                  value={setupMethod}
                  onChange={e => setSetupMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="instapay">InstaPay</option>
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">New Account Details</label>
                <input 
                  type="text"
                  value={setupDetails}
                  onChange={e => setSetupDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                  placeholder={setupMethod === "instapay" ? "e.g., user@instapay" : "Phone / IBAN"}
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Selfie with ID (Required)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-emerald-500 transition-all relative overflow-hidden h-32"
                >
                  {setupPreview ? (
                    <img src={setupPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <p className="text-[12px] font-bold text-slate-500 text-center">Click to upload photo</p>
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowChangeModal(false);
                  setSetupPhoto(null);
                  setSetupPreview(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-[14px] font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRequestSubmit}
                disabled={setupSubmitting}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-white text-[14px] font-black hover:bg-slate-900 disabled:opacity-50"
              >
                {setupSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
