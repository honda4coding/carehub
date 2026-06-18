"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  LuActivity,
  LuBanknote,
  LuCalendarDays,
  LuDownload,
  LuFileChartPie,
  LuRotateCcw,
  LuTrendingUp, LuUsers
} from "react-icons/lu";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell, Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";

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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const res = await axios.get(`${baseUrl}/doctor/reports/analytics?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
  const DEMO_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7'];

  if (!data && loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[hsl(var(--color-text-muted))] font-medium">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Header */}
      <header className="no-print sticky top-0 z-40 bg-[hsl(var(--color-bg-surface)/0.8)] backdrop-blur-xl border-b border-[hsl(var(--color-border))] px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-primary flex items-center justify-center text-xl shadow-inner">
            <LuTrendingUp />
          </div>
          <div>
            <h1 className="text-xl font-black text-[hsl(var(--color-text))] tracking-tight">Reports & Analytics</h1>
            <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
              <LuActivity className="text-primary" /> Clinic Performance Overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <div className="flex items-center px-3 py-2.5 bg-[hsl(var(--color-bg-soft))] border-r border-[hsl(var(--color-border))]">
              <LuCalendarDays className="text-primary text-lg" />
            </div>
            <div className="flex items-center relative group">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm font-black text-[hsl(var(--color-text))] focus:outline-none px-3 py-2.5 w-[135px] hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
            <div className="flex items-center px-3 text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border-x border-[hsl(var(--color-border))] h-full">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">To</span>
            </div>
            <div className="flex items-center relative group">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm font-black text-[hsl(var(--color-text))] focus:outline-none px-3 py-2.5 w-[135px] hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="flex items-center gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:text-rose-500 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
              title="Reset Filters"
            >
              <LuRotateCcw className="text-lg" />
            </button>
          )}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-[hsl(var(--color-primary)/0.1)] hover:bg-primary text-primary hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
          >
            <LuDownload className="text-lg" /> Export
          </button>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="print-area flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {loading && data && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-4 py-1.5 rounded-full shadow-lg text-xs font-bold animate-pulse">
            Refreshing Data...
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <LuBanknote className="text-6xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80 mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
              EGP {data?.kpis.totalRevenue?.toLocaleString() || 0}
            </h3>
            <p className="text-xs font-bold mt-2 flex items-center gap-1">
              <span className={data?.kpis.revenueGrowth! >= 0 ? "text-emerald-500" : "text-rose-500"}>
                {data?.kpis.revenueGrowth! >= 0 ? "+" : ""}{data?.kpis.revenueGrowth}%
              </span>
              <span className="text-[hsl(var(--color-text-muted))]">vs previous period</span>
            </p>
          </div>

          {/* Total Visits */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <LuUsers className="text-6xl text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-bold text-blue-600/80 dark:text-blue-400/80 mb-1">Total Visits</p>
            <h3 className="text-3xl font-black text-blue-700 dark:text-blue-300">
              {data?.kpis.totalVisits || 0}
            </h3>
            <p className="text-xs font-bold mt-2 flex items-center gap-1">
              <span className={data?.kpis.visitsGrowth! >= 0 ? "text-blue-500" : "text-rose-500"}>
                {data?.kpis.visitsGrowth! >= 0 ? "+" : ""}{data?.kpis.visitsGrowth}%
              </span>
              <span className="text-[hsl(var(--color-text-muted))]">vs previous period</span>
            </p>
          </div>

          {/* Online vs Walkin */}
          <div className="bg-gradient-to-br from-[hsl(var(--color-bg-surface))] to-[hsl(var(--color-bg-soft))] p-5 rounded-2xl border border-[hsl(var(--color-border))] shadow-sm sm:col-span-2 flex flex-col justify-center">
            <p className="text-sm font-bold text-[hsl(var(--color-text-muted))] mb-3">Visit Distribution</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-primary flex items-center gap-1"><LuTrendingUp /> Online</span>
                  <span className="text-lg font-black text-[hsl(var(--color-text))]">{data?.kpis.onlineVisits || 0}</span>
                </div>
                <div className="h-2 w-full bg-[hsl(var(--color-primary)/0.1)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${((data?.kpis.onlineVisits || 0) / Math.max(1, data?.kpis.totalVisits || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuUsers /> Walk-in</span>
                  <span className="text-lg font-black text-[hsl(var(--color-text))]">{data?.kpis.walkinVisits || 0}</span>
                </div>
                <div className="h-2 w-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--color-text-muted))] rounded-full" 
                    style={{ width: `${((data?.kpis.walkinVisits || 0) / Math.max(1, data?.kpis.totalVisits || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visit Trends Area Chart */}
          <div className="lg:col-span-2 bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--color-text))] flex items-center gap-2">
                  <LuActivity className="text-primary" /> Visit Trends
                </h3>
                <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">Number of completed visits per day</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.visitTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--color-text-muted))' }} 
                    dy={10}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--color-text-muted))' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--color-primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                    activeDot={{ r: 6, fill: "hsl(var(--color-primary))", stroke: "var(--color-bg-surface)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Demographics Pie Chart */}
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] p-5 shadow-sm">
            <h3 className="text-base font-bold text-[hsl(var(--color-text))] flex items-center gap-2 mb-2">
              <LuFileChartPie className="text-rose-500" /> Patient Demographics
            </h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))] mb-4">Age distribution for online patients</p>
            
            <div className="h-[250px] w-full">
              {data?.ageDemographics && data.ageDemographics.length > 0 && data.ageDemographics.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ageDemographics.filter(d => d.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.ageDemographics.filter(d => d.count > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--color-text))', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[hsl(var(--color-text-muted))] text-sm font-bold bg-[hsl(var(--color-bg-soft))] rounded-xl border border-dashed border-[hsl(var(--color-border))]">
                  No demographics data
                </div>
              )}
            </div>
          </div>

        </div>
        
      </main>
    </div>
  );
}
