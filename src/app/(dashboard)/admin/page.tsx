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
import { fetchClient } from "@/services/fetchClient";
import NotificationBell from "@/components/global/NotificationBell";
import { Topbar } from "@/components/global/Topbar";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { ActivityFeed, Activity } from "@/components/admin/dashboard/ActivityFeed";
import PendingApprovalsTable from "@/components/admin/dashboard/PendingApprovalsTable";
import ActivityOverviewChart from "@/components/admin/dashboard/ActivityOverviewChart";

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
        rightElement={<NotificationBell basePath="/admin/notifications" />}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full">
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
          <div className="lg:col-span-2 flex flex-col h-[400px]">
            <ActivityOverviewChart
              dailyStats={dailyStats}
              statsLoading={statsLoading}
              totalPatients={totalPatients ?? null}
              totalDoctors={totalDoctors ?? null}
              totalAppointments={totalAppointments ?? null}
            />
          </div>

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
