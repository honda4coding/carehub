"use client";

import { useEffect, useState, useRef } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, Wallet, Transaction, PayoutRequest, PayoutProfile } from "@/services/walletService";
import { LuWallet, LuHistory, LuArrowDownToLine, LuCircleCheck, LuCircleX, LuClock, LuLock, LuImage, LuPen } from "react-icons/lu";

export default function DoctorWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactionsData, setTransactionsData] = useState<{ transactions: Transaction[], pagination: any }>({ transactions: [], pagination: null });
  const [payoutsData, setPayoutsData] = useState<{ payouts: PayoutRequest[], pagination: any }>({ payouts: [], pagination: null });
  const [profile, setProfile] = useState<PayoutProfile | null>(null);
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [txPage, setTxPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  // Modals
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Setup / Change form state
  const [setupMethod, setSetupMethod] = useState("instapay");
  const [setupDetails, setSetupDetails] = useState("");
  const [setupPhoto, setSetupPhoto] = useState<File | null>(null);
  const [setupPreview, setSetupPreview] = useState<string | null>(null);
  const [setupError, setSetupError] = useState("");
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payout Request state
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState("");

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
    setSetupError("");
    if (!setupDetails) return setSetupError("Please enter your account details");
    if (!setupPhoto) return setSetupError("Please upload a photo of yourself with your ID");

    setSetupSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", setupMethod);
      formData.append("accountDetails", setupDetails);
      formData.append("idPhoto", setupPhoto);

      await walletService.setupPayoutProfile(formData);
      await loadData();
    } catch (err: any) {
      setSetupError(err.response?.data?.message || err.message || "Failed to setup profile");
    } finally {
      setSetupSubmitting(false);
    }
  };

  const handleChangeRequestSubmit = async () => {
    setSetupError("");
    if (!setupDetails) return setSetupError("Please enter your new account details");
    if (!setupPhoto) return setSetupError("Please upload a photo of yourself with your ID");

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
      alert("Change request submitted successfully. It will be reviewed by an admin.");
      await loadData();
    } catch (err: any) {
      setSetupError(err.response?.data?.message || err.message || "Failed to request change");
    } finally {
      setSetupSubmitting(false);
    }
  };

  const handleRequestPayout = async () => {
    setPayoutError("");
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) return setPayoutError("Invalid amount");
    if (wallet && amount > wallet.availableBalance) return setPayoutError("Amount exceeds available balance");

    setPayoutSubmitting(true);
    try {
      await walletService.requestPayout({ amount, selectedMethodId });
      setShowPayoutModal(false);
      setPayoutAmount("");
      loadData();
    } catch (err: any) {
      setPayoutError(err.response?.data?.message || err.message || "Failed to request payout");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg-base))] p-8 animate-pulse"><div className="h-32 bg-[hsl(var(--color-bg-soft))] rounded-2xl w-full max-w-5xl mx-auto" /></div>;
  }

  // SHOW FULL SCREEN WIZARD IF NOT SETUP
  if (profile && !profile.isSetup) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg-base))] justify-center items-center p-4">
        <div className="bg-[hsl(var(--color-bg-surface))] max-w-md w-full rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.2)] rounded-2xl flex items-center justify-center mb-6">
            <LuLock className="text-[hsl(var(--color-primary))] text-3xl" />
          </div>
          <h1 className="text-[24px] font-black text-[hsl(var(--color-text))] mb-2">Secure Payout Setup</h1>
          <p className="text-[14px] text-[hsl(var(--color-text-muted))] font-medium mb-8">
            Before using your wallet for withdrawals, you must securely setup your payout details. These details will be locked to prevent unauthorized withdrawals.
          </p>
          {profile.hasPendingRequest ? (
            <div className="bg-[hsl(var(--color-warning)/0.1)] border border-[hsl(var(--color-warning)/0.2)] p-6 rounded-xl text-center">
              <LuClock className="text-[hsl(var(--color-warning))] text-4xl mx-auto mb-3" />
              <h3 className="text-[16px] font-black text-[hsl(var(--color-warning))] mb-2">Verification Pending</h3>
              <p className="text-[14px] text-[hsl(var(--color-warning))] font-medium">
                Your payout profile setup is currently being reviewed by our administration team. You will be able to access your wallet once approved.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {profile.lastRejectedReason && (
                <div className="bg-[hsl(var(--color-danger)/0.1)] border border-[hsl(var(--color-danger)/0.2)] p-4 rounded-xl text-[hsl(var(--color-danger))] text-[13px] font-bold">
                  <p className="flex items-center gap-2 mb-1"><LuCircleX className="text-[hsl(var(--color-danger))] text-lg" /> Previous Request Rejected</p>
                  <p className="font-medium text-[hsl(var(--color-danger))] pl-6">{profile.lastRejectedReason}</p>
                </div>
              )}
              <div>
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider">Payment Method</label>
                <select 
                  value={setupMethod}
                  onChange={e => setSetupMethod(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20 font-bold text-[hsl(var(--color-text))] transition-all"
                >
                <option value="instapay">InstaPay</option>
                <option value="vodafone_cash">Vodafone Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider">Account Details</label>
              <input 
                type="text"
                value={setupDetails}
                onChange={e => setSetupDetails(e.target.value)}
                className="w-full px-4 py-3.5 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary))]/20 font-bold text-[hsl(var(--color-text))] transition-all"
                placeholder={setupMethod === "instapay" ? "e.g., user@instapay" : "Phone / IBAN"}
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider">Identity Verification (Selfie with ID)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] hover:border-[hsl(var(--color-primary))] transition-all relative overflow-hidden"
              >
                {setupPreview ? (
                  <img src={setupPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <LuImage className="text-[hsl(var(--color-text-muted))] text-4xl mb-3" />
                    <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] text-center">Click to upload a clear photo of your face holding your National ID next to it.</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <button
              onClick={handleSetupSubmit}
              disabled={setupSubmitting}
              className="w-full py-4 mt-4 bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-50 text-[hsl(var(--color-bg-surface))] rounded-xl text-[15px] font-black transition-all shadow-md shadow-[hsl(var(--color-primary))]/20"
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
    <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg-base))] overflow-y-auto">
      <DashboardHeader title="My Wallet" subtitle="Manage your earnings and payouts" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-black text-[hsl(var(--color-text))] flex items-center gap-2">
              <LuWallet className="text-[hsl(var(--color-primary))]" /> My Wallet
            </h1>
            <p className="text-[14px] text-[hsl(var(--color-text-muted))] font-medium">Manage your balance and request withdrawals.</p>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--color-primary))] text-[hsl(var(--color-bg-surface))] rounded-xl text-[14px] font-bold hover:opacity-90 transition-colors shadow-sm"
          >
            <LuArrowDownToLine /> Request Withdrawal
          </button>
        </div>

        {/* PAYOUT METHODS CARDS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[hsl(var(--color-text))]">Approved Payment Methods</h3>
            <button 
              onClick={() => setShowChangeModal(true)}
              className="px-4 py-2 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.2)] rounded-lg text-[13px] font-bold hover:bg-[hsl(var(--color-primary)/0.2)] transition-colors"
            >
              + Add New Method
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payoutMethods.length > 0 ? (
              payoutMethods.map(method => (
                <div key={method._id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--color-primary))]"></div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--color-primary))]">
                      {method.methodType.replace(/_/g, ' ')}
                    </p>
                    <div className="w-8 h-8 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center">
                      <LuLock />
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{method.accountDetails}</p>
                    <button 
                      onClick={() => setShowChangeModal(true)}
                      className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors p-1"
                      title="Edit Method"
                    >
                      <LuPen size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : profile?.paymentMethod ? (
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--color-primary))]"></div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[hsl(var(--color-primary))]">
                    {profile.paymentMethod.replace(/_/g, ' ')}
                  </p>
                  <div className="w-8 h-8 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center">
                    <LuLock />
                  </div>
                </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{profile.accountDetails}</p>
                    <button 
                      onClick={() => setShowChangeModal(true)}
                      className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors p-1"
                      title="Edit Method"
                    >
                      <LuPen size={16} />
                    </button>
                  </div>
                </div>
            ) : (
              <p className="text-[hsl(var(--color-text-muted))] text-sm font-medium">No approved payment methods yet.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] p-6 rounded-2xl shadow-sm flex flex-col items-start justify-between lg:col-span-2">
            <div className="w-full flex items-center justify-between mb-4">
              <p className="text-[hsl(var(--color-text-muted))] text-[13px] font-bold uppercase tracking-wider">Available Balance</p>
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center">
                <LuArrowDownToLine className="text-[hsl(var(--color-primary))] text-lg" />
              </div>
            </div>
            <p className="text-[36px] font-black text-[hsl(var(--color-text))] mb-2">
              {wallet?.availableBalance ?? 0} <span className="text-[16px] text-[hsl(var(--color-text-muted))]">EGP</span>
            </p>
            {profile?.isSuspended ? (
              <div className="w-full mt-2 bg-[hsl(var(--color-danger)/0.1)] border border-[hsl(var(--color-danger)/0.2)] rounded-xl p-3 flex items-start gap-2 text-[hsl(var(--color-danger))]">
                <LuLock className="mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[12px] font-black uppercase">Wallet Suspended</span>
                  <span className="text-[11px] font-medium leading-tight">{profile.suspendReason || "Your wallet has been suspended by an administrator."}</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowPayoutModal(true)}
                disabled={!wallet || wallet.availableBalance <= 0 || profile?.hasPendingRequest}
                className="w-full mt-2 bg-[hsl(var(--color-primary))] text-[hsl(var(--color-bg-surface))] font-bold py-3 rounded-xl hover:bg-[hsl(var(--color-primary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
              >
                Withdraw Funds
              </button>
            )}
          </div>
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <p className="text-[hsl(var(--color-text-muted))] text-[13px] font-bold uppercase tracking-wider mb-2">Pending Balance</p>
            <p className="text-[30px] font-black text-[hsl(var(--color-text))]">{wallet?.pendingBalance ?? 0} <span className="text-[14px] text-[hsl(var(--color-text-muted))]">EGP</span></p>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium mt-2 leading-tight">Funds waiting for appointments to complete</p>
          </div>

          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border-soft))]">
              <p className="text-[hsl(var(--color-text-muted))] text-[12px] font-bold uppercase tracking-wider">Lifetime Earnings Summary</p>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
              <div>
                <p className="text-[hsl(var(--color-text-muted))] text-[11px] font-bold uppercase tracking-wider mb-1">Total Paid By All Clients</p>
                <p className="text-[18px] font-black text-[hsl(var(--color-text))]">
                  {wallet?.grossRevenue ?? 0} <span className="text-[11px] text-[hsl(var(--color-text-muted))]">EGP</span>
                </p>
              </div>
              <div>
                <p className="text-[hsl(var(--color-text-muted))] text-[11px] font-bold uppercase tracking-wider mb-1">Total Platform Fees Deducted</p>
                <p className="text-[18px] font-black text-[hsl(var(--color-danger))]">
                  -{wallet?.feesPaid ?? 0} <span className="text-[11px] text-[hsl(var(--color-text-muted))]">EGP</span>
                </p>
              </div>
              <div className="mt-2 pt-4 border-t border-[hsl(var(--color-border-soft))]">
                <p className="text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-wider mb-1">── Current Rate ──</p>
                <p className="text-[14px] font-black text-[hsl(var(--color-text))]">
                  {wallet?.myCurrentCommissionRate ?? 0}% 
                  <span className="text-[hsl(var(--color-text-muted))] text-[12px] font-medium ml-1">({wallet?.myCurrentPlanName ? wallet.myCurrentPlanName.charAt(0).toUpperCase() + wallet.myCurrentPlanName.slice(1) : 'Free'} Plan)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transactions */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[hsl(var(--color-border-soft))] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuHistory className="text-[hsl(var(--color-text-muted))]" />
                <h2 className="text-[16px] font-bold text-[hsl(var(--color-text))]">Recent Transactions</h2>
              </div>
            </div>
            {transactionsData.transactions.length === 0 ? (
              <div className="p-8 text-center text-[hsl(var(--color-text-muted))] text-[14px] font-medium">No transactions found.</div>
            ) : (
              <div className="flex flex-col h-[400px]">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[hsl(var(--color-bg-surface))]">
                    <tr className="bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] text-[12px] uppercase tracking-wider">
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Type</th>
                      <th className="p-4 font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--color-border-soft))]">
                    {transactionsData.transactions.map((t: any) => {
                      const isCredit = t.type === 'credit';
                      return (
                        <tr key={t._id} className="text-[14px] font-medium text-[hsl(var(--color-text))]">
                          <td className="p-4 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] rounded-lg text-[12px] font-bold">
                              {(t.purpose || t.type).replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className={`p-4 font-bold ${isCredit ? 'text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-danger))]'}`}>
                            {isCredit ? '+' : '-'}{Math.abs(t.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
                {transactionsData.pagination && transactionsData.pagination.totalPages > 1 && (
                  <div className="p-4 border-t border-[hsl(var(--color-border-soft))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))] mt-auto">
                    <button 
                      disabled={txPage === 1} 
                      onClick={() => setTxPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded text-[12px] font-bold disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">Page {txPage} of {transactionsData.pagination.totalPages}</span>
                    <button 
                      disabled={txPage === transactionsData.pagination.totalPages} 
                      onClick={() => setTxPage(p => p + 1)}
                      className="px-3 py-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded text-[12px] font-bold disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payouts */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[hsl(var(--color-border-soft))] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuArrowDownToLine className="text-[hsl(var(--color-text-muted))]" />
                <h2 className="text-[16px] font-bold text-[hsl(var(--color-text))]">Withdrawal Requests</h2>
              </div>
              <button 
                onClick={() => setShowPayoutModal(true)}
                className="text-[13px] font-bold text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-strong))]"
              >
                Request Withdrawal
              </button>
            </div>
            {payoutsData.payouts.length === 0 ? (
              <div className="p-8 text-center text-[hsl(var(--color-text-muted))] text-[14px] font-medium flex-1 flex items-center justify-center">No withdrawal requests found.</div>
            ) : (
              <div className="flex flex-col flex-1 h-[400px]">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[hsl(var(--color-bg-surface))]">
                    <tr className="bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] text-[12px] uppercase tracking-wider">
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--color-border-soft))]">
                    {payoutsData.payouts.map(p => (
                      <tr key={p._id} className="text-[14px] font-medium text-[hsl(var(--color-text))]">
                        <td className="p-4 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-bold">{p.amount} EGP</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            {p.status === "pending" && <span className="flex items-center gap-1 text-[hsl(var(--color-warning))] bg-[hsl(var(--color-warning)/0.1)] px-2 py-1 rounded-md text-[12px] w-fit font-bold"><LuClock/> Pending</span>}
                            {p.status === "paid" && (
                                <>
                                    <span className="flex items-center gap-1 text-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.1)] px-2 py-1 rounded-md text-[12px] w-fit font-bold"><LuCircleCheck/> Paid</span>
                                    {p.receiptPhoto?.secure_url && (
                                        <button 
                                            onClick={() => window.open(p.receiptPhoto!.secure_url, '_blank')}
                                            className="text-[11px] font-bold text-[hsl(var(--color-primary))] hover:underline text-left w-fit"
                                        >
                                            View Receipt
                                        </button>
                                    )}
                                </>
                            )}
                            {p.status === "rejected" && (
                                <>
                                    <span className="flex items-center gap-1 text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.1)] px-2 py-1 rounded-md text-[12px] w-fit font-bold"><LuCircleX/> Rejected</span>
                                    {p.adminNotes && (
                                        <span className="text-[11px] text-[hsl(var(--color-danger))] font-medium max-w-[150px] leading-tight">
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
                  <div className="p-4 border-t border-[hsl(var(--color-border-soft))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))] mt-auto">
                    <button 
                      disabled={payoutPage === 1} 
                      onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded text-[12px] font-bold disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">Page {payoutPage} of {payoutsData.pagination.totalPages}</span>
                    <button 
                      disabled={payoutPage === payoutsData.pagination.totalPages} 
                      onClick={() => setPayoutPage(p => p + 1)}
                      className="px-3 py-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded text-[12px] font-bold disabled:opacity-50"
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
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--color-bg-base))]/40 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-[18px] font-black text-[hsl(var(--color-text))] mb-4">Request Withdrawal</h3>
            
            {payoutError && <div className="mb-4 p-3 bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] rounded-xl text-[13px] font-bold">{payoutError}</div>}

            <div className="p-4 bg-[hsl(var(--color-bg-soft))] rounded-xl border border-[hsl(var(--color-border-soft))] mb-6">
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-bold mb-1">FUNDS WILL BE SENT TO:</p>
              <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{profile?.paymentMethod} - {profile?.accountDetails}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wider">Select Payout Destination</label>
                {payoutMethods.length > 0 ? (
                  <select 
                    value={selectedMethodId}
                    onChange={e => setSelectedMethodId(e.target.value)}
                    className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold"
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
              <div>
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wider">Amount (EGP)</label>
                <input 
                  type="number"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-[hsl(var(--color-border))] text-[14px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={payoutSubmitting}
                className="flex-1 py-3 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-bg-surface))] text-[14px] font-black hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-50"
              >
                {payoutSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE REQUEST MODAL */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--color-bg-base))]/40 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-8 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[20px] font-black text-[hsl(var(--color-text))] mb-2">Request Payout Change</h3>
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] font-medium mb-6">
              For security, changing your payout destination requires admin approval.
            </p>

            {setupError && <div className="mb-4 p-3 bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] rounded-xl text-[13px] font-bold">{setupError}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wider">New Payment Method</label>
                <select 
                  value={setupMethod}
                  onChange={e => setSetupMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold"
                >
                  <option value="instapay">InstaPay</option>
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wider">New Account Details</label>
                <input 
                  type="text"
                  value={setupDetails}
                  onChange={e => setSetupDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold"
                  placeholder={setupMethod === "instapay" ? "e.g., user@instapay" : "Phone / IBAN"}
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wider">Selfie with ID (Required)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] hover:border-[hsl(var(--color-primary))] transition-all relative overflow-hidden h-32"
                >
                  {setupPreview ? (
                    <img src={setupPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] text-center">Click to upload photo</p>
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
                className="flex-1 py-3 rounded-xl border border-[hsl(var(--color-border))] text-[14px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRequestSubmit}
                disabled={setupSubmitting}
                className="flex-1 py-3 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-bg-surface))] text-[14px] font-black hover:bg-[hsl(var(--color-bg-base))] disabled:opacity-50"
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
