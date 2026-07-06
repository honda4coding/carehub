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
        backPath="/doctor"
      />

      <main className="print-area flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Filters & Export Bar — moved out of header for responsive safety */}
          <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-3">
            {/* Date Range Picker */}
            <div className="flex items-center bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden flex-1 min-w-0">
              <div className="flex items-center px-3 py-2 border-r border-[hsl(var(--color-border))] shrink-0">
                <LuCalendarDays className="text-[hsl(var(--color-primary))] text-base shrink-0" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-2 py-2 flex-1 min-w-0 hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
              />
              <div className="flex items-center px-2 text-[hsl(var(--color-text-muted))] border-x border-[hsl(var(--color-border))] shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider">To</span>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-2 py-2 flex-1 min-w-0 hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
              />
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] hover:border-[hsl(var(--color-danger)/0.3)] transition-all"
                  title="Reset Filters"
                >
                  <LuRotateCcw className="text-base" />
                </button>
              )}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-white border border-transparent transition-all"
              >
                <LuDownload className="text-base" /> Export
              </button>
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

        {wallet && role !== 'assistant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[hsl(var(--color-bg))] rounded-2xl border border-[hsl(var(--color-border))] overflow-hidden flex flex-col">
                <div className="p-4 sm:p-5 border-b border-[hsl(var(--color-border))]">
                  <div className="flex items-center gap-2">
                    <LuWallet className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                    <h3 className="font-bold text-[hsl(var(--color-text))]">
                      Wallet Balance
                    </h3>
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center bg-[hsl(var(--color-primary)/0.03)]">
                  <div className="text-center">
                    <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-2">
                      Available to Withdraw
                    </p>
                    <p className="text-4xl sm:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight">
                      <span className="text-2xl text-[hsl(var(--color-text-muted))] mr-1">
                        EGP
                      </span>
                      {wallet?.availableBalance?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-[hsl(var(--color-bg))] p-4 sm:p-5 border-t border-[hsl(var(--color-border))]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[hsl(var(--color-text-muted))]">
                      Pending Balance
                    </span>
                    <span className="font-bold text-[hsl(var(--color-text))]">
                      EGP {(wallet?.pendingBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            {/* Transferred Section */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">Total Transferred / Withdrawn</span>
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-success-bg))] flex items-center justify-center text-[hsl(var(--color-success))]">
                  <LuArrowDownToLine className="text-xl" />
                </div>
              </div>
              <div>
                <p className="text-[32px] font-black text-[hsl(var(--color-text))]">
                  {data?.kpis?.totalWithdrawn?.toLocaleString() || 0} EGP
                </p>
                <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1 flex items-center gap-1">
                  Selected Period
                </p>
              </div>
            </div>
          </div>
        )}

        <ReportsCharts
          visitTrends={data?.visitTrends}
          ageDemographics={data?.ageDemographics}
        />
        </div>
      </main>
    </div>
  );
}
