"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService, Wallet, Transaction, PayoutRequest, PayoutProfile } from "@/services/walletService";
import { LuWallet, LuLock } from "react-icons/lu";

// Components
import WalletSetupWizard from "@/components/patients/wallet/WalletSetupWizard";
import WithdrawalModal from "@/components/patients/wallet/WithdrawalModal";
import ChangeRequestModal from "@/components/patients/wallet/ChangeRequestModal";
import TransactionTable from "@/components/patients/wallet/TransactionTable";
import PayoutsTable from "@/components/patients/wallet/PayoutsTable";
import PayoutMethodsCard from "@/components/patients/wallet/PayoutMethodsCard";
import BalanceCard from "@/components/patients/wallet/BalanceCard";

export default function PatientWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactionsData, setTransactionsData] = useState<{ transactions: Transaction[], pagination: any }>({ transactions: [], pagination: null });
  const [payoutsData, setPayoutsData] = useState<{ payouts: PayoutRequest[], pagination: any }>({ payouts: [], pagination: null });
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [profile, setProfile] = useState<PayoutProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [txPage, setTxPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  // Modals
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

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
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [txPage, payoutPage]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg-base))] p-8 animate-pulse">
        <div className="h-32 bg-[hsl(var(--color-bg-soft))] rounded-2xl w-full max-w-5xl mx-auto shadow-sm" />
      </div>
    );
  }

  // SHOW FULL SCREEN WIZARD IF NOT SETUP
  if (profile && !profile.isSetup) {
    return <WalletSetupWizard profile={profile} onSetupComplete={loadData} />;
  }

  // NORMAL WALLET VIEW
  return (
    <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg-base))] overflow-y-auto">
      <DashboardHeader title="My Wallet" subtitle="Manage your balance and withdrawals" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuWallet className="text-[hsl(var(--color-primary))]" /> My Wallet
          </h1>
          <button 
            onClick={() => setShowWithdraw(true)}
            disabled={!wallet || wallet.availableBalance <= 0 || profile?.isSuspended}
            className="px-6 py-2.5 bg-[hsl(var(--color-text))] text-[hsl(var(--color-bg-base))] rounded-xl text-sm font-bold tracking-tight hover:opacity-90 transition-all shadow-[var(--shadow-md)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Request Withdrawal
          </button>
        </div>

        {/* Suspension Banner */}
        {profile?.isSuspended && (
          <div className="w-full bg-[hsl(var(--color-danger)/0.1)] border border-[hsl(var(--color-danger)/0.2)] rounded-2xl p-4 flex items-start gap-3 text-[hsl(var(--color-danger))] shadow-sm">
            <LuLock className="mt-1 shrink-0 text-xl" />
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-wider">Wallet Suspended</span>
              <span className="text-[13px] font-medium mt-1 opacity-90">{profile.suspendReason || "Your wallet has been suspended by an administrator."}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Balance Display - Left Side */}
          <div className="lg:col-span-4 flex flex-col">
            <BalanceCard wallet={wallet} />
          </div>

          {/* Payout Methods - Right Side */}
          <div className="lg:col-span-8 flex flex-col">
            <PayoutMethodsCard 
              payoutMethods={payoutMethods} 
              profile={profile} 
              onAddMethod={() => setShowChangeModal(true)} 
            />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionTable 
            transactions={transactionsData.transactions} 
            pagination={transactionsData.pagination} 
            page={txPage} 
            setPage={setTxPage} 
          />
          <PayoutsTable 
            payouts={payoutsData.payouts} 
            pagination={payoutsData.pagination} 
            page={payoutPage} 
            setPage={setPayoutPage} 
          />
        </div>
      </div>

      {/* Modals */}
      <WithdrawalModal 
        isOpen={showWithdraw} 
        onClose={() => setShowWithdraw(false)} 
        wallet={wallet} 
        payoutMethods={payoutMethods} 
        profile={profile} 
        onSuccess={loadData} 
      />
      
      <ChangeRequestModal 
        isOpen={showChangeModal} 
        onClose={() => setShowChangeModal(false)} 
        onSuccess={loadData} 
      />
    </div>
  );
}
