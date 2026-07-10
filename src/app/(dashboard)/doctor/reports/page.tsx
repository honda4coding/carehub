"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { LuCalendarDays, LuRotateCcw, LuDownload } from "react-icons/lu";
import ReportsKPIs from "@/components/doctor/reports/ReportsKPIs";
import ReportsCharts from "@/components/doctor/reports/ReportsCharts";

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    revenueGrowth: number;
    totalVisits: number;
    visitsGrowth: number;
    onlineVisits: number;
    walkinVisits: number;
    totalWithdrawn: number;
  };
  visitTrends: { date: string; visits: number }[];
  ageDemographics: { name: string; count: number }[];
}

import { useClinicContext } from "@/context/ClinicContext";
import { walletService, Wallet, Transaction } from "@/services/walletService";
import { LuWallet, LuArrowDownToLine } from "react-icons/lu";

import { useAuth } from "@/context/AuthContext";

export default function DoctorReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { activeClinicId } = useClinicContext();
  const { role } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("auth_token");
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (activeClinicId && activeClinicId !== "all") {
          params.append("clinicId", activeClinicId);
        }

        const res = await axios.get(
          `${baseUrl}/doctor/reports/analytics?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data.data);

        // Fetch wallet only for doctor/admin
        if (role !== 'assistant') {
            try {
                const [walletData, transactionsData] = await Promise.all([
                    walletService.getMyWallet(),
                    walletService.getMyTransactions()
                ]);
                setWallet(walletData);
                setTransactions(transactionsData.transactions || []);
            } catch (e) {
                console.error("Failed to load wallet for analytics", e);
            }
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [startDate, endDate, activeClinicId]);

  const handleExport = () => {
    window.print();
  };

  if (!data && loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[hsl(var(--color-primary)/0.3)] border-t-[hsl(var(--color-primary))] rounded-full animate-spin"></div>
          <p className="text-[hsl(var(--color-text-muted))] font-bold text-sm">
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg))]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `,
        }}
      />

      <DashboardHeader
        title="Reports & Analytics"
        subtitle="Clinic performance overview"
        showBack={true}
      />

      <main className="print-area flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Filters, Actions & Quick Stats Bar */}
          <div className="no-print flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-3">
            
            {/* Quick Wallet Stats (Left) */}
            {wallet && role !== 'assistant' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
                {/* Balance Card */}
                <div className="flex-1 flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-[hsl(var(--color-primary))] shrink-0">
                    <LuWallet className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Wallet Balance</p>
                    <p className="text-base sm:text-lg font-black text-[hsl(var(--color-text))] truncate">{wallet?.availableBalance?.toLocaleString() || 0} <span className="text-[10px] sm:text-xs text-[hsl(var(--color-text-muted))]">EGP</span></p>
                  </div>
                </div>

                {/* Withdrawn Card */}
                <div className="flex-1 flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-success-bg))] flex items-center justify-center text-[hsl(var(--color-success))] shrink-0">
                    <LuArrowDownToLine className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-0.5">Total Withdrawn</p>
                    <p className="text-base sm:text-lg font-black text-[hsl(var(--color-text))] truncate">{data?.kpis?.totalWithdrawn?.toLocaleString() || 0} <span className="text-[10px] sm:text-xs text-[hsl(var(--color-text-muted))]">EGP</span></p>
                  </div>
                </div>
              </div>
            ) : (
               <div className="flex-1" />
            )}

            {/* Filters & Actions (Right) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* Date Range Picker */}
              <div className="flex items-center bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden shrink-0 w-full sm:w-auto">
                <div className="flex items-center px-2 sm:px-3 h-10 border-r border-[hsl(var(--color-border))] shrink-0">
                  <LuCalendarDays className="text-[hsl(var(--color-primary))] text-base shrink-0" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-1 sm:px-2 h-10 flex-1 min-w-[110px] sm:w-[130px] sm:flex-none hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
                />
                <div className="flex items-center px-1 sm:px-2 h-10 text-[hsl(var(--color-text-muted))] border-x border-[hsl(var(--color-border))] shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider">To</span>
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-1 sm:px-2 h-10 flex-1 min-w-[110px] sm:w-[130px] sm:flex-none hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] hover:border-[hsl(var(--color-danger)/0.3)] transition-all shrink-0"
                    title="Reset Filters"
                  >
                    <LuRotateCcw className="text-base" />
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl text-sm font-bold bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-white border border-transparent transition-all shrink-0"
                >
                  <LuDownload className="text-base" /> Export
                </button>
              </div>
            </div>
          </div>

        {loading && data && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[hsl(var(--color-primary))] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md animate-pulse">
            Refreshing Data...
          </div>
        )}

          <ReportsKPIs 
            kpis={data?.kpis} 
            isAssistant={role === 'assistant'}
          />



        <ReportsCharts
          visitTrends={data?.visitTrends}
          ageDemographics={data?.ageDemographics}
        />
        </div>
      </main>
    </div>
  );
}
