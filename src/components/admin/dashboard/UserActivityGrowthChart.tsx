"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { LuTrendingUp } from "react-icons/lu";
import { adminService } from "@/services/adminService";
import { useTranslations } from "next-intl";

// Indigo for Users (matches summary card)
const COLOR_USERS = "hsl(var(--color-indigo))";
// Warning/amber for Patients (matches summary card)  
const COLOR_PATIENTS = "hsl(var(--color-warning))";
// Secondary/pink for Appointments
const COLOR_APPOINTMENTS = "hsl(var(--color-secondary))";

interface ChartDataItem {
  label: string;
  usersCount: number;
  patientsCount: number;
  appointmentsCount: number;
}

interface UserActivityGrowthChartProps {
  startDate: string;
  endDate: string;
}

export default function UserActivityGrowthChart({ startDate, endDate }: UserActivityGrowthChartProps) {
    const t = useTranslations("auto");
  const [interval, setInterval_] = useState("week");
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAnalyticsData(startDate, endDate, interval);
      setData(res.data?.chartData || []);
    } catch (error) {
      console.error("Failed to fetch chart data", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, interval]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Format labels for XAxis and Tooltip based on interval
  const formatLabel = (val: unknown) => {
    const s = String(val ?? "");
    if (!s) return "";
    
    if (interval === 'week') {
      const [year, weekStr] = s.split('-W');
      if (year && weekStr) return `W${weekStr}`;
    }
    
    if (interval === 'year') {
      return s;
    }
    
    if (interval === 'month') {
      const [year, month] = s.split('-');
      if (year && month) {
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      }
    }
    
    if (interval === 'day') {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    return s;
  };

  const formatTooltipLabel = (val: unknown) => {
    const s = String(val ?? "");
    if (!s) return "";
    
    if (interval === 'week') {
      const [year, weekStr] = s.split('-W');
      if (year && weekStr) return `Week ${weekStr}, ${year}`;
    }

    if (interval === 'month') {
      const [year, month] = s.split('-');
      if (year && month) {
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      }
    }
    
    if (interval === 'day') {
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    }

    return s;
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-indigo-bg))] text-[hsl(var(--color-indigo))] flex items-center justify-center">
            <LuTrendingUp className="text-[16px]" />
          </div>
          <h2 className="text-[14px] font-black uppercase tracking-[.04em] text-[hsl(var(--color-text))]">{t('userActivityGrowth')}</h2>
        </div>
        
        {/* Interval Selector */}
        <div className="flex items-center bg-[hsl(var(--color-bg))] rounded-lg p-1 border border-[hsl(var(--color-border))]">
          {['day', 'week', 'month', 'year'].map((intv) => (
            <button
              key={intv}
              onClick={() => setInterval_(intv)}
              className={`px-3 py-1 text-[11px] font-bold rounded-md capitalize transition-colors cursor-pointer ${
                interval === intv 
                  ? 'bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]' 
                  : 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface-hover))]'
              }`}
            >
              {intv}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px] w-full mt-2 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--color-bg-surface)/0.7)] z-10 rounded-xl">
            <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">{t('updating')}</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="colorUsersGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_USERS} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={COLOR_USERS} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPatientsGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_PATIENTS} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={COLOR_PATIENTS} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorApptsGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR_APPOINTMENTS} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={COLOR_APPOINTMENTS} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={formatLabel}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} 
              axisLine={false} 
              tickLine={false} 
            />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }}
              itemStyle={{ fontWeight: 'bold' }}
              labelStyle={{ color: 'hsl(var(--color-text-muted))', marginBottom: '4px' }}
              labelFormatter={formatTooltipLabel}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', marginTop: '10px' }} />
            <Area type="monotone" name="Total Users" dataKey="usersCount" stroke={COLOR_USERS} strokeWidth={3} fillOpacity={1} fill="url(#colorUsersGrowth)" />
            <Area type="monotone" name="Total Patients" dataKey="patientsCount" stroke={COLOR_PATIENTS} strokeWidth={2} fillOpacity={1} fill="url(#colorPatientsGrowth)" strokeDasharray="5 3" />
            <Area type="monotone" name="Total Appointments" dataKey="appointmentsCount" stroke={COLOR_APPOINTMENTS} strokeWidth={3} fillOpacity={1} fill="url(#colorApptsGrowth)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
