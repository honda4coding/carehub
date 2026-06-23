"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { LuTrendingUp, LuScale, LuHeart, LuDroplets, LuFilter, LuCalendar } from "react-icons/lu";

export default function DoctorVitalsCharts({ history }: { history: any[] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Filter by selected dates
    let filteredHistory = [...history];
    if (startDate) {
      const start = new Date(startDate).setHours(0,0,0,0);
      filteredHistory = filteredHistory.filter(r => new Date(r.createdAt).setHours(0,0,0,0) >= start);
    }
    if (endDate) {
      const end = new Date(endDate).setHours(23,59,59,999);
      filteredHistory = filteredHistory.filter(r => new Date(r.createdAt).getTime() <= end);
    }

    // Sort chronologically (oldest first)
    const sorted = filteredHistory.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Group by Day (displayDate)
    // For each day, we take the latest available value for each vital
    const dailyMap = new Map();

    sorted.forEach(r => {
      const date = new Date(r.createdAt);
      const displayDate = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

      let bmi = null;
      let bloodPressureSystolic = null;
      let bloodPressureDiastolic = null;

      if (r.weight && r.height) {
        const hMeters = Number(r.height) / 100;
        if (hMeters > 0) {
          bmi = Number((Number(r.weight) / (hMeters * hMeters)).toFixed(1));
        }
      }

      if (r.bloodPressure && typeof r.bloodPressure === 'string') {
        const parts = r.bloodPressure.split('/');
        if (parts.length === 2) {
          bloodPressureSystolic = Number(parts[0]);
          bloodPressureDiastolic = Number(parts[1]);
        }
      }

      const existing = dailyMap.get(displayDate) || { displayDate };

      // Overwrite with newer values, unless newer value is null/empty
      if (r.weight) existing.weight = Number(r.weight);
      if (bmi) existing.bmi = bmi;
      if (bloodPressureSystolic) existing.bloodPressureSystolic = bloodPressureSystolic;
      if (bloodPressureDiastolic) existing.bloodPressureDiastolic = bloodPressureDiastolic;
      if (r.sugarLevel) existing.bloodSugar = Number(r.sugarLevel);
      if (r.pulse) existing.pulse = Number(r.pulse);
      if (r.temperature) existing.temperature = Number(r.temperature);

      dailyMap.set(displayDate, existing);
    });

    // Only keep days that have at least ONE vital sign recorded
    const finalData = Array.from(dailyMap.values()).filter((d: any) => 
      d.weight || d.bmi || d.bloodPressureSystolic || d.bloodSugar || d.pulse || d.temperature
    );

    return finalData;
  }, [history, startDate, endDate]);

  if (!history || history.length === 0) {
    return (
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-10 text-center col-span-full mt-6">
        <LuTrendingUp className="text-4xl text-[hsl(var(--color-text-muted))] opacity-40 mx-auto mb-3" />
        <h3 className="text-[14px] font-black text-[hsl(var(--color-text))]">No Vitals History</h3>
        <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] mt-1">
          Historical charts will appear here once vitals are recorded in encounters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-6 col-span-full">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 gap-4">
        <h3 className="text-[13px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 w-full sm:w-auto uppercase tracking-wider">
          <LuFilter className="text-[hsl(var(--color-primary))]" /> Filter Charts
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex flex-col flex-1 relative">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="w-full sm:w-36 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-3 py-2 text-xs font-bold focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text-muted))]" 
            />
          </div>
          <span className="text-[hsl(var(--color-border))] font-bold">-</span>
          <div className="flex flex-col flex-1 relative">
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="w-full sm:w-36 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-3 py-2 text-xs font-bold focus:border-[hsl(var(--color-primary))] outline-none text-[hsl(var(--color-text-muted))]" 
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }} 
              className="px-4 py-2 rounded-xl text-xs font-bold text-danger bg-danger-light hover:bg-danger-light border border-red-200 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-10 text-center col-span-full">
          <LuCalendar className="text-4xl text-[hsl(var(--color-text-muted))] opacity-40 mx-auto mb-3" />
          <h3 className="text-[14px] font-black text-[hsl(var(--color-text))]">No data in this period</h3>
          <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] mt-1">
            Try adjusting or clearing your date filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight & BMI Trends */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col">
            <h3 className="text-[13px] font-black uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
              <LuScale className="text-[hsl(var(--color-primary))]" /> Weight & BMI Trends
            </h3>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line yAxisId="left" type="monotone" name="Weight (kg)" dataKey="weight" stroke="hsl(var(--color-primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                  <Line yAxisId="left" type="monotone" name="BMI" dataKey="bmi" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blood Pressure History */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col">
            <h3 className="text-[13px] font-black uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
              <LuHeart className="text-danger" /> Blood Pressure History
            </h3>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line type="monotone" name="Systolic" dataKey="bloodPressureSystolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" name="Diastolic" dataKey="bloodPressureDiastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sugar, Pulse & Temp Trends */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col lg:col-span-2">
            <h3 className="text-[13px] font-black uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
              <LuDroplets className="text-primary" /> Sugar, Pulse & Temp Trends
            </h3>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line yAxisId="left" type="monotone" name="Blood Sugar (mg/dL)" dataKey="bloodSugar" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  <Line yAxisId="right" type="monotone" name="Pulse (bpm)" dataKey="pulse" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  <Line yAxisId="right" type="monotone" name="Temp (°C)" dataKey="temperature" stroke="#fb923c" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
