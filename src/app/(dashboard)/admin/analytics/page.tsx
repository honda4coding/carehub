"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import { AnalyticsData } from "@/types/admin";
import {
  LuChevronLeft,
  LuFileChartPie,
  LuTrendingUp,
  LuActivity,
  LuUsers,
  LuStethoscope,
  LuUser,
} from "react-icons/lu";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#00BFA6", "#6C5DD3", "#FFA043", "#FF6B6B", "#3A3A3C", "#A0A0A0"];

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAnalyticsData(startDate, endDate);
        setAnalyticsData(res.data);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const activityArray = analyticsData?.summary ? [
    { name: "Appointments", value: analyticsData.summary.totalAppointments },
    { name: "Prescriptions", value: analyticsData.summary.totalPrescriptions },
    { name: "Med Histories", value: analyticsData.summary.totalMedicalHistories },
  ] : [];

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto bg-[hsl(var(--color-bg))]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-[9px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            <LuChevronLeft className="text-[15px]" />
          </button>

          <div>
            <h1 className="text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight">
              Detailed Analytics
            </h1>
            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
              Deep dive into platform metrics and statistics
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-[11px] font-semibold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary flex-1 sm:w-auto sm:min-w-[120px]"
            />
            <span className="text-[12px] text-[hsl(var(--color-text-muted))]">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-[11px] font-semibold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 outline-none focus:border-primary flex-1 sm:w-auto sm:min-w-[120px]"
            />
          </div>
          <button 
            onClick={() => { setStartDate(""); setEndDate(""); }}
            className="w-full sm:w-auto text-[11px] font-bold text-[hsl(var(--color-danger))] px-3 py-1.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-md hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">Loading Analytics Data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-[hsl(var(--color-primary)/0.15)] text-primary flex items-center justify-center">
                <LuUsers className="text-xl" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Total Users</p>
                <p className="text-[20px] font-black text-[hsl(var(--color-text))]">{analyticsData?.summary?.totalUsers || 0}</p>
              </div>
            </div>
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))] flex items-center justify-center">
                <LuStethoscope className="text-xl" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Total Doctors</p>
                <p className="text-[20px] font-black text-[hsl(var(--color-text))]">{analyticsData?.summary?.totalDoctors || 0}</p>
              </div>
            </div>
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] flex items-center justify-center">
                <LuUser className="text-xl" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Total Patients</p>
                <p className="text-[20px] font-black text-[hsl(var(--color-text))]">{analyticsData?.summary?.totalPatients || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* User Growth Chart */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] flex items-center justify-center">
                  <LuTrendingUp className="text-[16px]" />
                </div>
                <h2 className="text-[14px] font-black uppercase tracking-[.04em] text-[hsl(var(--color-text))]">User & Activity Growth</h2>
              </div>
            </div>
            
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.chartData || []} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorUsersAn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-secondary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--color-secondary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApptsAn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(val) => {
                      if (!val) return "";
                      const d = new Date(val);
                      return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
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
                    labelFormatter={(val) => {
                      if (!val) return "";
                      const d = new Date(val);
                      return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', marginTop: '10px' }} />
                  <Area type="monotone" name="Total Users" dataKey="usersCount" stroke="hsl(var(--color-secondary))" strokeWidth={3} fillOpacity={1} fill="url(#colorUsersAn)" />
                  <Area type="monotone" name="Total Appointments" dataKey="appointmentsCount" stroke="hsl(var(--color-primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorApptsAn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Specialty Distribution */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))] flex items-center justify-center">
                <LuFileChartPie className="text-[16px]" />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-[.04em] text-[hsl(var(--color-text))]">Doctors by Specialty</h2>
            </div>

            <div className="h-[250px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.doctorsBySpecialty || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(analyticsData?.doctorsBySpecialty || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(analyticsData?.doctorsBySpecialty || []).slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-[hsl(var(--color-text-muted))] truncate">{item.name}</span>
                  </div>
                  <span className="text-[hsl(var(--color-text))]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Overview Bar Chart */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-[8px] bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] flex items-center justify-center">
                <LuActivity className="text-[16px]" />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-[.04em] text-[hsl(var(--color-text))]">System Activity Total</h2>
            </div>

            <div className="h-[250px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityArray} margin={{ top: 5, right: 20, bottom: 25, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--color-bg-soft))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--color-bg-surface))', borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {activityArray.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
