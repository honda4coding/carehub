"use client";

import { useEffect, useState } from "react";
import {
  LuUsers,
  LuStethoscope,
  LuCalendarDays,
  LuClock,
  LuTriangleAlert,
} from "react-icons/lu";

import { adminService } from "@/services/adminService";
import { PendingDoctorRequest } from "@/types/doctor";
import { DailyStats } from "@/types/admin";
import NotificationBell from "@/components/admin/notifications/NotificationBell";
import { Topbar } from "@/components/global/Topbar";
import { Card } from "@/components/ui/Card";
import { fetchClient } from "@/services/fetchClient";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { ActivityFeed, Activity } from "@/components/admin/dashboard/ActivityFeed";
import { PendingApprovalsTable } from "@/components/admin/dashboard/PendingApprovalsTable";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<PendingDoctorRequest[]>([]);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [activeDoctors, setActiveDoctors] = useState<number | null>(null);
  const [totalDoctors, setTotalDoctors] = useState<number | null>(null);
  const [totalAppointments, setTotalAppointments] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [visibleLines, setVisibleLines] = useState({
    patients: true,
    doctors: true,
    appointments: true
  });

  const toggleLine = (line: 'patients' | 'doctors' | 'appointments') => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const pendingCount = requests.length;

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setRequestsError(null);
      try {
        const res = await adminService.getPendingDoctors();
        setRequests(res.data || []);
      } catch (err: any) {
        setRequestsError(err?.message ?? "Failed to fetch pending doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const dashboard = await adminService.getDashboard(true);
        setTotalPatients(dashboard.data.totalPatients);
        setTotalDoctors(dashboard.data.totalDoctors);
        setTotalAppointments(dashboard.data.totalAppointments);
        setActiveDoctors(
          dashboard.data.totalDoctors -
            dashboard.data.pendingDoctors -
            ((dashboard.data as any).rejectedDoctors || 0),
        );
      } catch (err: any) {
        setStatsError(err?.message ?? "Failed to load dashboard statistics.");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await adminService.getDailyStats();
        setDailyStats(res.data);
      } catch (err) {
        // console.error("Failed to fetch daily stats", err);
      }
    };
    fetchDaily();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        const res = await fetchClient.get("/notifications", { params: { limit: "15" } });
        setRecentActivities(res.data?.notifications ?? []);
      } catch (err) {
        // console.error("Failed to fetch activities", err);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Topbar 
        title="Dashboard Overview" 
        subtitle="Welcome back. Here is what's happening today."
        rightElement={<NotificationBell />}
      />

      <main className="flex-1 p-5 md:p-8 overflow-auto flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
        {/* Stats error banner */}
        {statsError && (
          <div className="flex items-center gap-2.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl px-4 py-3">
            <LuTriangleAlert className="text-[hsl(var(--color-danger))] text-[16px] shrink-0" />
            <p className="text-[13px] font-bold text-[hsl(var(--color-danger))] flex-1">
              {statsError}
            </p>
          </div>
        )}

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            label="New Patients"
            value={totalPatients ?? "—"}
            loading={statsLoading}
            icon={<LuUsers />}
            iconStyle="bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]"
          />
          <StatCard
            label="New Doctors"
            value={totalDoctors ?? "—"}
            loading={statsLoading}
            icon={<LuStethoscope />}
            iconStyle="bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
          />
          <StatCard
            label="New Appointments"
            value={totalAppointments ?? "—"}
            loading={statsLoading}
            icon={<LuCalendarDays />}
            iconStyle="bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]"
          />
          <StatCard
            label="Pending Approvals"
            value={pendingCount}
            loading={loading}
            icon={<LuClock />}
            iconStyle="bg-[hsl(var(--color-warning)/0.15)] text-[hsl(var(--color-warning))]"
          />
        </div>

        {/* ── Chart & Activity Feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chart Section */}
          <Card className="lg:col-span-2 p-6 flex flex-col h-[400px]">
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

          {/* Activity Feed Section */}
          <div className="h-[400px]">
            <ActivityFeed activities={recentActivities} loading={activitiesLoading} />
          </div>
        </div>

        {/* ── Pending Approvals Table ── */}
        <PendingApprovalsTable
          requests={requests}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
        />
        
      </main>
    </div>
  );
}
