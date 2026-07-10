import { fetchClient } from "@/services/fetchClient";
import { GetUsersParams, GetUsersResponse } from "@/types/user";
import { DoctorApprovalStatus, GetDoctorsResponse, GetPendingDoctorsResponse } from "@/types/doctor";
import { GetDashboardData, MonthlyStats, DailyStats, AnalyticsData, FinancialStats } from "@/types/admin";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";



// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminProfile {
  fullName:        string;
  email:           string;
  phoneNumber:     string;
  address?:        string;
  profilepicture?: { secure_url: string; public_id: string };
}

export interface UpdateAdminProfilePayload {
  fullName?:    string;
  phoneNumber?: string;
  address?:     string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────
export async function getAdminProfile(): Promise<AdminProfile> {
  const res = await fetchClient.get("/admin/profile");
  return res.data;
}

export async function updateAdminProfile(payload: UpdateAdminProfilePayload): Promise<void> {
  await fetchClient.request("/admin/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export const adminService = {

  getUsers: (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.role) query.role = params.role;
    if(params.status) query.status = params.status;
    if(params.search) query.search = params.search;
    return fetchClient.get("/admin/users", { method: "GET" , params: query });
  },

  getDashboard: (last30Days?: boolean): Promise<GetDashboardData> => 
    fetchClient.get("/admin/dashboard", { params: last30Days ? { last30Days: "true" } : {} }),

  getMonthlyStats: (year?: number): Promise<{ data: MonthlyStats[] }> =>
    fetchClient.get("/admin/stats/monthly", { params: year ? { year: String(year) } : {} }),

  getDailyStats: (startDate?: string, endDate?: string, defaultAllTime?: boolean): Promise<{ data: DailyStats[] }> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (defaultAllTime) params.append("defaultAllTime", "true");
    const qs = params.toString();
    return fetchClient.get(`/admin/stats/daily${qs ? `?${qs}` : ""}`);
  },

  getAnalyticsData: (startDate?: string, endDate?: string, interval: string = 'week'): Promise<{ data: AnalyticsData }> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (interval) params.interval = interval;
    return fetchClient.get("/admin/stats/analytics", { params });
  },

  getFinancialStats: (startDate?: string, endDate?: string): Promise<{ data: FinancialStats }> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return fetchClient.get("/admindashboard/financial-stats", { params });
  },

  getPaymentAnalytics: (startDate?: string, endDate?: string): Promise<{ data: any }> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return fetchClient.get("/admin/stats/payments", { params });
  },

  getDoctors: (params: { status?: string, page?: number, limit?: number, search?: string } = {}): Promise<GetDoctorsResponse> => {
    const query: Record<string, string> = {};
    if (params.status) query.status = params.status;
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.search) query.search = params.search;
    return fetchClient.get("/admin/doctors", { params: query });
  },

  getPendingDoctors: (startDate?: string, endDate?: string): Promise<GetPendingDoctorsResponse> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return fetchClient.get("/admin/doctors/pending", { params });
  },

  activateUser: (id: string) =>
    fetchClient.request(`/admin/${id}/activate`, { method: "PATCH" }),

  deactivateUser: (id: string) =>
    fetchClient.request(`/admin/${id}/deactivate`, { method: "PATCH" }),

  getPendingLicenseDoctors: (): Promise<{ data: PendingLicenseDoctor[] }> =>
    fetchClient.get("/admin/doctors/pending-licenses"),

  approveDoctorLicense: (id: string) =>
    fetchClient.request(`/admin/doctors/${id}/approve-license`, { method: "PATCH" }),

  rejectDoctorLicense: (id: string, reason?: string) =>
    fetchClient.request(`/admin/doctors/${id}/reject-license`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  getSupportMessages: (page: number = 1, limit: number = 10, search?: string, filter?: string): Promise<any> => {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (filter && filter !== 'all') params.filter = filter;
    return fetchClient.get("/support", { params });
  },

  getUnreadSupportMessagesCount: (): Promise<any> => {
    return fetchClient.get("/support/unread-count");
  },

  toggleSupportMessageReadStatus: (messageId: string): Promise<any> => {
    return fetchClient.request(`/support/${messageId}/read`, { method: "PATCH" });
  }

};

export interface PendingLicenseDoctor {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  specialty?: string;
  pendingLicenseImage: { secure_url: string; public_id: string };
  licenseimage?: { secure_url: string; public_id: string };
  updatedAt: string;
}

// ─── Profile Image & Delete Account ──────────────────────────────────────────

/** PATCH /admin/profile-image */
export async function uploadAdminAvatar(file: File): Promise<{ secure_url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("profilepicture", file);
  const res = await fetchClient.patch("/admin/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data?.profilepicture || res.data?.profilepicture;
}

/** DELETE /admin/profile-image */
export async function deleteAdminAvatar(): Promise<void> {
  await fetchClient.delete("/admin/profile-image");
}

/** DELETE /user/profile */
export async function deleteAdminAccount(): Promise<void> {
  await fetchClient.request("/user/profile", { method: "DELETE" });
}