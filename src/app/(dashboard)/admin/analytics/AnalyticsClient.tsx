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

const COLORS = [
  "hsl(var(--color-primary))", 
  "hsl(var(--color-indigo))", 
  "hsl(var(--color-warning))", 
  "hsl(var(--color-danger))", 
  "hsl(var(--color-secondary))", 
  "hsl(var(--color-success))"
];

interface AnalyticsClientProps {
  initialAnalyticsData: AnalyticsData | null;
  initialDailyStats: DailyStats[];
  initialPendingRequests: PendingDoctorRequest[];
}

export default function AnalyticsClient({
  initialAnalyticsData,
  initialDailyStats,
  initialPendingRequests,
}: AnalyticsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(initialAnalyticsData);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>(initialDailyStats);
  const [pendingRequests, setPendingRequests] = useState<PendingDoctorRequest[]>(initialPendingRequests);

  // Skip the first render since we have initial data from the server.
  // If dates change, we fetch new data on the client.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }

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

    if (isMounted) {
      fetchData();
    }
  }, [startDate, endDate, isMounted]);

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
            className="w-8 h-8 rounded-[9px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-surface-hover))] hover:text-[hsl(var(--color-text))] transition-all cursor-pointer"
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

        <DateRangeFilter 
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={() => { setStartDate(""); setEndDate(""); }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 flex flex-col h-[400px]">
          <ActivityOverviewChart
            dailyStats={dailyStats}
            statsLoading={loading}
            totalPatients={analyticsData?.summary?.totalPatients ?? null}
            totalDoctors={analyticsData?.summary?.totalDoctors ?? null}
            totalAppointments={analyticsData?.summary?.totalAppointments ?? null}
          />
        </div>

        {/* Small metric cards stacked */}
        <div className="flex flex-col gap-4 h-full">
          <SummaryCard 
            title="Registered Patients"
            value={analyticsData?.summary?.totalPatients}
            icon={<LuUsers className="text-[hsl(var(--color-primary-strong))]" />}
            iconBg="bg-[hsl(var(--color-primary)/0.15)]"
            loading={loading}
          />
          <SummaryCard 
            title="Total Doctors"
            value={analyticsData?.summary?.totalDoctors}
            icon={<LuStethoscope className="text-[hsl(var(--color-secondary-strong))]" />}
            iconBg="bg-[hsl(var(--color-secondary)/0.15)]"
            loading={loading}
          />
          <SummaryCard 
            title="Total Users"
            value={analyticsData?.summary?.totalUsers}
            icon={<LuUser className="text-[hsl(var(--color-warning))]" />}
            iconBg="bg-[hsl(var(--color-warning)/0.15)]"
            loading={loading}
          />
        </div>

        {/* Pie Chart: Doctor Specialties */}
        <div className="flex flex-col h-[350px]">
           <SpecialtyPieChart 
             data={analyticsData?.doctorSpecialties ?? []} 
             loading={loading} 
             colors={COLORS} 
           />
        </div>

        {/* Line Chart: User Growth */}
        <div className="flex flex-col h-[350px]">
           <UserActivityGrowthChart 
             data={dailyStats} 
             loading={loading} 
             color="hsl(var(--color-primary-strong))" 
           />
        </div>

        {/* Bar Chart: System Activity */}
        <div className="flex flex-col h-[350px]">
           <SystemActivityBarChart 
             data={activityArray} 
             loading={loading} 
             colors={COLORS} 
           />
        </div>

      </div>
    </div>
  );
}
