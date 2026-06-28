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
  };
  visitTrends: { date: string; visits: number }[];
  ageDemographics: { name: string; count: number }[];
}

export default function DoctorReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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

        const res = await axios.get(
          `${baseUrl}/doctor/reports/analytics?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [startDate, endDate]);

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
        rightElement={
          <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Date Range Picker */}
            <div className="flex items-center bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
              <div className="flex items-center px-3 py-2 border-r border-[hsl(var(--color-border))]">
                <LuCalendarDays className="text-[hsl(var(--color-primary))] text-base shrink-0" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-2 py-2 w-[120px] hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
              />
              <div className="flex items-center px-2 text-[hsl(var(--color-text-muted))] border-x border-[hsl(var(--color-border))]">
                <span className="text-[10px] font-black uppercase tracking-wider">To</span>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-[hsl(var(--color-text))] focus:outline-none px-2 py-2 w-[120px] hover:bg-[hsl(var(--color-bg-surface))] transition-colors cursor-pointer"
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
        }
      />

      <main className="print-area flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {loading && data && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[hsl(var(--color-primary))] text-white px-4 py-2 rounded-full text-xs font-bold shadow-md animate-pulse">
            Refreshing Data...
          </div>
        )}

        <ReportsKPIs kpis={data?.kpis} />

        <ReportsCharts
          visitTrends={data?.visitTrends}
          ageDemographics={data?.ageDemographics}
        />
        </div>
      </main>
    </div>
  );
}
