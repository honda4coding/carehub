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
import { FiPieChart } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";

export default function FinancialOverview() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getFinancialStats();
        setStats(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch financial stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[hsl(var(--color-surface))] rounded-[20px] p-6 h-[140px] border border-[hsl(var(--color-border))]"></div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null; // Silent fail or you can render an error state
  }

  const totalPlatformProfits = 
    (stats.platformBookingProfits || 0) + 
    (stats.platformSubscriptionProfits || 0);

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-[hsl(var(--color-text))] flex items-center gap-2">
          <FiPieChart className="text-[hsl(var(--color-primary))]" />
          Financial Overview
        </h2>
        <span className="text-sm px-3 py-1 bg-[hsl(var(--color-primary)_/_0.1)] text-[hsl(var(--color-primary))] rounded-full font-medium">
          Platform Revenue & Health
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Platform Profits */}
        <div className="bg-[hsl(var(--color-surface))] rounded-[24px] p-6 border border-[hsl(var(--color-border))] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[hsl(var(--color-primary)_/_0.05)] rounded-full group-hover:scale-110 transition-transform duration-500 ease-out pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Platform Net Profit</p>
              <h3 className="text-3xl font-extrabold text-[hsl(var(--color-text))]">
                {totalPlatformProfits.toLocaleString()} <span className="text-lg font-medium text-[hsl(var(--color-text-muted))]">EGP</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <LuTrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[hsl(var(--color-text-muted))] block mb-1">From Bookings</span>
              <span className="font-semibold text-[hsl(var(--color-text))]">{stats.platformBookingProfits.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[hsl(var(--color-text-muted))] block mb-1">From Subscriptions</span>
              <span className="font-semibold text-[hsl(var(--color-text))]">{stats.platformSubscriptionProfits.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Doctors Total Revenue */}
        <div className="bg-[hsl(var(--color-surface))] rounded-[24px] p-6 border border-[hsl(var(--color-border))] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Total System Volume</p>
              <h3 className="text-3xl font-extrabold text-[hsl(var(--color-text))]">
                {stats.totalDoctorsEarnings.toLocaleString()} <span className="text-lg font-medium text-[hsl(var(--color-text-muted))]">EGP</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <BiMoney className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-[hsl(var(--color-text-muted))] mt-4">
            Total money paid by patients across all doctors on the platform.
          </p>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-[hsl(var(--color-surface))] rounded-[24px] p-6 border border-[hsl(var(--color-border))] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-500/5 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2">Cancellation Rate</p>
              <h3 className="text-3xl font-extrabold text-[hsl(var(--color-text))]">
                {stats.cancellationRate}%
              </h3>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
              <LuBan className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-[hsl(var(--color-background))] rounded-full h-1.5 mt-4">
            <div 
              className="h-1.5 rounded-full bg-rose-500"
              style={{ width: `${Math.min(stats.cancellationRate, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-[hsl(var(--color-text-muted))] mt-2">
            Percentage of cancelled appointments out of total bookings.
          </p>
        </div>

      </div>
    </div>
  );
}
