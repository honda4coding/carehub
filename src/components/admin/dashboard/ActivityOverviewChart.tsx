"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { DailyStats } from "@/types/admin";
import { Card } from "@/components/ui/Card";

export interface ActivityOverviewChartProps {
  dailyStats: DailyStats[];
  statsLoading: boolean;
  totalPatients: number | null;
  totalDoctors: number | null;
  totalAppointments: number | null;
}

export default function ActivityOverviewChart({
  dailyStats,
  statsLoading,
  totalPatients,
  totalDoctors,
  totalAppointments,
}: ActivityOverviewChartProps) {
  const [visibleLines, setVisibleLines] = useState({
    patients: true,
    doctors: true,
    appointments: true,
  });

  const toggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  return (
    <Card className="p-6 flex flex-col h-[400px] border border-[hsl(var(--color-border-soft))] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] md:text-[18px] font-bold text-[hsl(var(--color-text))]">
          Activity Overview
        </h3>
      </div>
      
      <div className="flex-1 w-full min-h-0 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyStats} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-secondary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--color-secondary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-success))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--color-success))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(val) => {
                if (!val) return "";
                const currentYear = new Date().getFullYear();
                const d = new Date(`${val}/${currentYear}`);
                return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} 
              axisLine={false} 
              tickLine={false} 
              width={30}
            />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }}
              itemStyle={{ fontWeight: 'bold' }}
              labelStyle={{ color: 'hsl(var(--color-text-muted))', marginBottom: '4px' }}
              labelFormatter={(val) => {
                if (!val) return "";
                const currentYear = new Date().getFullYear();
                const d = new Date(`${val}/${currentYear}`);
                return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
              }}
            />
            <Area hide={!visibleLines.patients} type="monotone" name="New Patients" dataKey="patientsCount" stroke="hsl(var(--color-primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
            <Area hide={!visibleLines.doctors} type="monotone" name="New Doctors" dataKey="doctorsCount" stroke="hsl(var(--color-secondary))" strokeWidth={3} fillOpacity={1} fill="url(#colorDoctors)" />
            <Area hide={!visibleLines.appointments} type="monotone" name="New Appointments" dataKey="appointmentsCount" stroke="hsl(var(--color-success))" strokeWidth={3} fillOpacity={1} fill="url(#colorAppts)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 border-t border-[hsl(var(--color-border))] shrink-0">
        <button 
          onClick={() => toggleLine('patients')}
          className={`flex flex-col items-start p-2 rounded-xl text-left transition-all hover:bg-[hsl(var(--color-bg-soft))] cursor-pointer ${!visibleLines.patients ? 'opacity-40 grayscale' : 'opacity-100'}`}
        >
          <p className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))]">
            {statsLoading ? "—" : totalPatients?.toLocaleString() ?? "—"}
          </p>
          <p className="text-[11px] md:text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--color-primary))]" />
            New Patients
          </p>
        </button>
        <button 
          onClick={() => toggleLine('doctors')}
          className={`flex flex-col items-start p-2 rounded-xl text-left transition-all hover:bg-[hsl(var(--color-bg-soft))] cursor-pointer ${!visibleLines.doctors ? 'opacity-40 grayscale' : 'opacity-100'}`}
        >
          <p className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))]">
            {statsLoading ? "—" : totalDoctors?.toLocaleString() ?? "—"}
          </p>
          <p className="text-[11px] md:text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--color-secondary))]" />
            New Doctors
          </p>
        </button>
        <button 
          onClick={() => toggleLine('appointments')}
          className={`flex flex-col items-start p-2 rounded-xl text-left transition-all hover:bg-[hsl(var(--color-bg-soft))] cursor-pointer ${!visibleLines.appointments ? 'opacity-40 grayscale' : 'opacity-100'}`}
        >
          <p className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))]">
            {statsLoading ? "—" : totalAppointments?.toLocaleString() ?? "—"}
          </p>
          <p className="text-[11px] md:text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--color-success))]" />
            New Appointments
          </p>
        </button>
      </div>
    </Card>
  );
}
