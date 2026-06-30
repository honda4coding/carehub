"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import { AnalyticsData, DailyStats } from "@/types/admin";
import {
  LuChevronLeft,
  LuUsers,
  LuStethoscope,
  LuUser,
} from "react-icons/lu";

import { PendingDoctorRequest } from "@/types/doctor";
import ActivityOverviewChart from "@/components/admin/dashboard/ActivityOverviewChart";
import SummaryCard from "@/components/admin/dashboard/SummaryCard";
import UserActivityGrowthChart from "@/components/admin/dashboard/UserActivityGrowthChart";
import SpecialtyPieChart from "@/components/admin/dashboard/SpecialtyPieChart";
import SystemActivityBarChart from "@/components/admin/dashboard/SystemActivityBarChart";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useTranslations } from "next-intl";

const COLORS = [
  "hsl(var(--color-primary))", 
  "hsl(var(--color-indigo))", 
  "hsl(var(--color-warning))", 
  "hsl(var(--color-danger))", 
  "hsl(var(--color-secondary))", 
  "hsl(var(--color-success))"
];

export default function AnalyticsPage() {
    const t = useTranslations("auto");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingDoctorRequest[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setPendingLoading(true);
      try {
        const [res, pendingRes, dailyRes] = await Promise.all([
          adminService.getAnalyticsData(startDate, endDate),
          adminService.getPendingDoctors(startDate, endDate),
          adminService.getDailyStats(startDate, endDate, true)
        ]);
        setAnalyticsData(res.data);
        setPendingRequests(pendingRes.data);
        setDailyStats(dailyRes.data);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
        setPendingLoading(false);
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
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title={t('detailedAnalytics')}
        subtitle="Deep dive into platform metrics and statistics"
        backPath="/admin"
        rightElement={
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={() => { setStartDate(""); setEndDate(""); }}
          />
        }
      />
      <div className="flex-1 overflow-auto min-w-0 bg-[hsl(var(--color-bg))]">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">{t('loadingAnalyticsData')}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SummaryCard
              title={t('totalUsers_q9u0')}
              value={analyticsData?.summary?.totalUsers || 0}
              icon={LuUsers}
              colorTheme="indigo"
            />
            <SummaryCard
              title={t('totalDoctors_tcti')}
              value={analyticsData?.summary?.totalDoctors || 0}
              icon={LuStethoscope}
              colorTheme="success"
            />
            <SummaryCard
              title={t('totalPatients')}
              value={analyticsData?.summary?.totalPatients || 0}
              icon={LuUser}
              colorTheme="warning"
            />
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Top Row: Main Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* User & Activity Growth Chart */}
              <UserActivityGrowthChart
                startDate={startDate}
                endDate={endDate}
              />

              {/* Activity Overview */}
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl flex flex-col overflow-hidden">
                <ActivityOverviewChart
                  dailyStats={dailyStats}
                  statsLoading={loading}
                  totalPatients={analyticsData?.summary?.totalPatients || 0}
                  totalDoctors={analyticsData?.summary?.totalDoctors || 0}
                  totalAppointments={analyticsData?.summary?.totalAppointments || 0}
                />
              </div>
            </div>

            {/* Bottom Row: Distribution & System Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Specialty Distribution */}
              <SpecialtyPieChart
                data={analyticsData?.doctorsBySpecialty || []}
                colors={COLORS}
              />

              {/* System Activity Total */}
              <SystemActivityBarChart
                data={activityArray}
                colors={COLORS}
              />
            </div>
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
