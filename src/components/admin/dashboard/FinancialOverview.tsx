"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { FinancialStats } from "@/types/admin";
import { 
  LuWallet, 
  LuTrendingUp, 
  LuAward, 
  LuTriangleAlert,
  LuBan 
} from "react-icons/lu";
import { LuChartPie } from "react-icons/lu";
import { LuBanknote } from "react-icons/lu";

export default function FinancialOverview({ stats, loading }: { stats: FinancialStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-6 h-[140px] border border-[hsl(var(--color-border))] shadow-[var(--shadow-card)]"></div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null; // Silent fail or you can render an error state
  }

  const totalPlatformProfits = 
    (stats.platformBookingProfits || 0) + 
    (stats.platformSubscriptionProfits || 0);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Total Platform Profits */}
        <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-6 border border-[hsl(var(--color-border))] flex flex-col justify-between group hover:border-[hsl(var(--color-success)/0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[hsl(var(--color-success)/0.15)] rounded-2xl flex items-center justify-center text-[hsl(var(--color-success))] shrink-0 group-hover:scale-110 transition-transform duration-300">
              <LuTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Platform Net Profit</p>
              <h3 className="text-2xl font-black text-[hsl(var(--color-text))]">
                {totalPlatformProfits.toLocaleString()} <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">EGP</span>
              </h3>
            </div>
          </div>
          <div className="pt-4 border-t border-[hsl(var(--color-border-soft))] grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <span className="text-[hsl(var(--color-text-muted))] block mb-0.5">From Bookings</span>
              <span className="font-bold text-[hsl(var(--color-text))]">{stats.platformBookingProfits.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[hsl(var(--color-text-muted))] block mb-0.5">From Subscriptions</span>
              <span className="font-bold text-[hsl(var(--color-text))]">{stats.platformSubscriptionProfits.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Doctors Total Revenue */}
        <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-6 border border-[hsl(var(--color-border))] flex flex-col justify-between group hover:border-[hsl(var(--color-primary)/0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[hsl(var(--color-primary)/0.15)] rounded-2xl flex items-center justify-center text-[hsl(var(--color-primary))] shrink-0 group-hover:scale-110 transition-transform duration-300">
              <LuBanknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Total System Volume</p>
              <h3 className="text-2xl font-black text-[hsl(var(--color-text))]">
                {stats.totalDoctorsEarnings.toLocaleString()} <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">EGP</span>
              </h3>
            </div>
          </div>
          <div className="pt-4 border-t border-[hsl(var(--color-border-soft))] mt-auto">
            <p className="text-[12px] text-[hsl(var(--color-text-muted))] leading-relaxed">
              Total money paid by patients across all doctors on the platform.
            </p>
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-6 border border-[hsl(var(--color-border))] flex flex-col justify-between group hover:border-[hsl(var(--color-danger)/0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[hsl(var(--color-danger)/0.15)] rounded-2xl flex items-center justify-center text-[hsl(var(--color-danger))] shrink-0 group-hover:scale-110 transition-transform duration-300">
              <LuBan className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Cancellation Rate</p>
              <h3 className="text-2xl font-black text-[hsl(var(--color-text))]">
                {stats.cancellationRate}%
              </h3>
            </div>
          </div>
          <div className="pt-4 border-t border-[hsl(var(--color-border-soft))] mt-auto">
            <div className="w-full bg-[hsl(var(--color-bg-soft))] rounded-full h-1.5 mb-2 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-[hsl(var(--color-danger))]"
                style={{ width: `${Math.min(stats.cancellationRate, 100)}%` }}
              ></div>
            </div>
            <p className="text-[12px] text-[hsl(var(--color-text-muted))] leading-relaxed">
              Percentage of cancelled appointments out of total bookings.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


