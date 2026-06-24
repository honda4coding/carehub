import { adminService } from "@/services/adminService";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  let initialAnalyticsData: any = null;
  let initialDailyStats: any[] = [];
  let initialPendingRequests: any[] = [];

  try {
    const [res, pendingRes, dailyRes] = await Promise.all([
      adminService.getAnalyticsData("", "").catch(() => ({ data: null })),
      adminService.getPendingDoctors("", "").catch(() => ({ data: [] })),
      adminService.getDailyStats("", "", true).catch(() => ({ data: [] }))
    ]);
    
    initialAnalyticsData = res?.data || null;
    initialPendingRequests = pendingRes?.data || [];
    initialDailyStats = dailyRes?.data || [];
  } catch (error) {
    console.error("Failed to load initial analytics data", error);
  }

  return (
    <AnalyticsClient
      initialAnalyticsData={initialAnalyticsData}
      initialDailyStats={initialDailyStats}
      initialPendingRequests={initialPendingRequests}
    />
  );
}
