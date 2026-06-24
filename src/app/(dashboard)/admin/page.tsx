import { adminService } from "@/services/adminService";
import { fetchClient } from "@/services/fetchClient";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboard() {
  let initialRequests: any[] = [];
  let dashboardStats: any = null;
  let initialDailyStats: any[] = [];
  let initialActivities: any[] = [];
  let error: any = null;

  try {
    const [requestsRes, dashboardRes, dailyStatsRes, notificationsRes] = await Promise.all([
      adminService.getPendingDoctors().catch(() => ({ data: [] })),
      adminService.getDashboard(true).catch(() => ({ data: null })),
      adminService.getDailyStats().catch(() => ({ data: [] })),
      fetchClient.get("/notifications", { params: { limit: "15" } }).catch(() => ({ data: { notifications: [] } })),
    ]);

    initialRequests = requestsRes?.data || [];
    dashboardStats = dashboardRes?.data || null;
    initialDailyStats = dailyStatsRes?.data || [];
    initialActivities = notificationsRes?.data?.notifications || [];
  } catch (err: any) {
    error = err?.message || "Failed to load dashboard data.";
  }

  return (
    <DashboardClient
      initialRequests={initialRequests}
      dashboardStats={dashboardStats}
      initialDailyStats={initialDailyStats}
      initialActivities={initialActivities}
      error={error}
    />
  );
}
