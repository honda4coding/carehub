"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import ReportsHeader from "@/components/doctor/reports/ReportsHeader";
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
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))] p-4 md:p-6">
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

      <ReportsHeader
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onExport={handleExport}
      />

      <main className="print-area flex-1 max-w-7xl w-full mx-auto space-y-6">
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
      </main>
    </div>
  );
}
