"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { walletService } from "@/services/walletService";
import { LuWallet } from "react-icons/lu";
import PlatformLedgerCards from "@/components/admin/finance/PlatformLedgerCards";
import ManualWalletAdjustmentForm from "@/components/admin/finance/ManualWalletAdjustmentForm";
import toast from "react-hot-toast";

export default function AdminFinancePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);



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



  return (
    <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg))] overflow-y-auto">
      <DashboardHeader title="Finance & Ledger" subtitle="Monitor platform revenue and manage wallets" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[24px] font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuWallet className="text-[hsl(var(--color-primary))]" /> Platform Ledger
          </h1>
          <p className="text-[14px] text-[hsl(var(--color-text-muted))] font-medium">Global financial overview and support adjustments.</p>
        </div>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-32 bg-[hsl(var(--color-border))] rounded-2xl w-full" />
            <div className="h-64 bg-[hsl(var(--color-border))] rounded-2xl w-full" />
          </div>
        ) : (
          <>
            <PlatformLedgerCards stats={stats} />
            <ManualWalletAdjustmentForm onSuccess={loadData} />
          </>
        )}
      </div>
    </div>
  );
}
