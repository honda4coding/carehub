import { fetchClient } from "@/services/fetchClient";
import { GetUsersParams, GetUsersResponse } from "@/types/user";
import { DoctorApprovalStatus, GetDoctorsResponse, GetPendingDoctorsResponse } from "@/types/doctor";
import { GetDashboardData, MonthlyStats, DailyStats, AnalyticsData } from "@/types/admin";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

  getPaymentAnalytics: (): Promise<{ data: any }> =>
    fetchClient.get("/admin/stats/payments"),

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
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const formData = new FormData();
  formData.append("profilepicture", file);
  const res = await fetch(`${BASE_URL}/admin/profile-image`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload image");
  }
  const json = await res.json();
  return json.data.profilepicture;
}

/** DELETE /admin/profile-image */
export async function deleteAdminAvatar(): Promise<void> {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  const res = await fetch(`${BASE_URL}/admin/profile-image`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete image");
  }
}

/** DELETE /user/profile */
export async function deleteAdminAccount(): Promise<void> {
  await fetchClient.request("/user/profile", { method: "DELETE" });
}