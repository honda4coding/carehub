"use client";

import { Wallet } from "@/services/walletService";

interface BalanceCardProps {
  wallet: Wallet | null;
}

export default function BalanceCard({ wallet }: BalanceCardProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] p-8 rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px text-center w-full h-full flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-primary)/0.04)] to-transparent pointer-events-none" />
      
      <p className="text-[hsl(var(--color-text-muted))] text-xs font-bold uppercase tracking-widest mb-3 relative z-10">Available Balance</p>
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        <span className="text-xl font-bold tracking-tight text-[hsl(var(--color-text-muted))] mt-1">EGP</span>
        <span className="text-5xl font-black tracking-tighter text-[hsl(var(--color-primary))] group-hover:scale-105 transition-transform duration-300">
          {wallet?.availableBalance ?? 0}
        </span>
      </div>
      
      <p className="text-[13px] text-[hsl(var(--color-text-muted))] font-medium mt-3 relative z-10 opacity-80">Available for withdrawal</p>
    </div>
  );
}
