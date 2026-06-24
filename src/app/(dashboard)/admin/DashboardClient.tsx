"use client";

import { useState } from "react";
import {
  LuUsers,
  LuStethoscope,
  LuCalendarDays,
  LuClock,
  LuTriangleAlert,
} from "react-icons/lu";

import { PendingDoctorRequest } from "@/types/doctor";
import { DailyStats } from "@/types/admin";
import NotificationBell from "@/components/global/NotificationBell";
import { Topbar } from "@/components/global/Topbar";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { ActivityFeed, Activity } from "@/components/admin/dashboard/ActivityFeed";
import PendingApprovalsTable from "@/components/admin/dashboard/PendingApprovalsTable";
import ActivityOverviewChart from "@/components/admin/dashboard/ActivityOverviewChart";

interface DashboardClientProps {
  initialRequests: PendingDoctorRequest[];
  dashboardStats: any;
  initialDailyStats: DailyStats[];
  initialActivities: Activity[];
  error?: string | null;
}

export default function DashboardClient({
  initialRequests,
  dashboardStats,
  initialDailyStats,
  initialActivities,
  error,
}: DashboardClientProps) {
  const [filter, setFilter] = useState("");

  const pendingCount = initialRequests.length;
  
  const totalPatients = dashboardStats?.totalPatients ?? null;
  const totalDoctors = dashboardStats?.totalDoctors ?? null;
  const totalAppointments = dashboardStats?.totalAppointments ?? null;
  const pendingDoctors = dashboardStats?.pendingDoctors ?? 0;
  const rejectedDoctors = dashboardStats?.rejectedDoctors ?? 0;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Topbar 
        title="Dashboard Overview" 
        subtitle="Welcome back. Here is what's happening today."
        rightElement={<NotificationBell basePath="/admin/notifications" />}
      />

      <main className="flex-1 p-5 md:p-8 overflow-auto flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
        {/* Stats error banner */}
        {error && (
          <div className="flex items-center gap-2.5 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] rounded-xl px-4 py-3">
            <LuTriangleAlert className="text-[hsl(var(--color-danger))] text-[16px] shrink-0" />
            <p className="text-[13px] font-bold text-[hsl(var(--color-danger))] flex-1">
              {error}
            </p>
          </div>
        )}

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            label="New Patients"
            value={totalPatients ?? "—"}
            loading={false}
            icon={<LuUsers />}
            iconStyle="bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]"
          />
          <StatCard
            label="New Doctors"
            value={totalDoctors ?? "—"}
            loading={false}
            icon={<LuStethoscope />}
            iconStyle="bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
          />
          <StatCard
            label="New Appointments"
            value={totalAppointments ?? "—"}
            loading={false}
            icon={<LuCalendarDays />}
            iconStyle="bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]"
          />
          <StatCard
            label="Pending Approvals"
            value={pendingCount}
            loading={false}
            icon={<LuClock />}
            iconStyle="bg-[hsl(var(--color-warning)/0.15)] text-[hsl(var(--color-warning))]"
          />
        </div>

        {/* ── Chart & Activity Feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 flex flex-col h-[400px]">
            <ActivityOverviewChart
              dailyStats={initialDailyStats}
              statsLoading={false}
              totalPatients={totalPatients}
              totalDoctors={totalDoctors}
              totalAppointments={totalAppointments}
            />
          </div>

          {/* Activity Feed Section */}
          <div className="h-[400px]">
            <ActivityFeed activities={initialActivities} loading={false} />
          </div>
        </div>

        {/* ── Pending Approvals Table ── */}
        <PendingApprovalsTable
          requests={initialRequests}
          loading={false}
          filter={filter}
          setFilter={setFilter}
        />
      </main>
    </div>
  );
}
