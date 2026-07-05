import React from "react";
import { LuTrendingUp } from "react-icons/lu";

interface PlatformLedgerCardsProps {
  stats: any;
}

export default function PlatformLedgerCards({ stats }: PlatformLedgerCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[hsl(var(--color-primary-strong))] p-6 rounded-2xl shadow-sm text-[hsl(var(--color-text-inverse))] relative overflow-hidden">
        <LuTrendingUp className="absolute -right-4 -bottom-4 text-[120px] opacity-10" />
        <p className="opacity-80 text-[13px] font-bold uppercase tracking-wider mb-2 relative z-10">Total Platform Revenue</p>
        <p className="text-[36px] font-black relative z-10">{stats?.totalRevenue ?? 0} <span className="opacity-70 text-lg">EGP</span></p>
      </div>
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] p-6 rounded-2xl shadow-sm">
        <p className="text-[hsl(var(--color-text-muted))] text-[13px] font-bold uppercase tracking-wider mb-2">Global Liabilities (Available)</p>
        <p className="text-[36px] font-black text-[hsl(var(--color-text))]">{stats?.totalAvailable ?? 0} <span className="text-[hsl(var(--color-text-muted))] text-lg">EGP</span></p>
        <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium">Total funds available to be withdrawn</p>
      </div>
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] p-6 rounded-2xl shadow-sm">
        <p className="text-[hsl(var(--color-text-muted))] text-[13px] font-bold uppercase tracking-wider mb-2">Global Liabilities (Pending)</p>
        <p className="text-[36px] font-black text-[hsl(var(--color-text))]">{stats?.totalPending ?? 0} <span className="text-[hsl(var(--color-text-muted))] text-lg">EGP</span></p>
        <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium">Funds locked in upcoming appointments</p>
      </div>
    </div>
  );
}
