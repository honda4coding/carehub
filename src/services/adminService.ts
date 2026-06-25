import { fetchClient } from "@/services/fetchClient";
import { GetUsersParams, GetUsersResponse } from "@/types/user";
import { DoctorApprovalStatus, GetDoctorsResponse, GetPendingDoctorsResponse } from "@/types/doctor";
import { GetDashboardData, MonthlyStats, DailyStats, AnalyticsData } from "@/types/admin";

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
    // must convert params to be string as it is defined in the fetchClient.ts as a Record<String,String>
    // so it cant still be GetUsersParams type
    const query: Record<string, string> = {};

    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.role) query.role = params.role;
    if(params.status) query.status = params.status;

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

  /** GET /admin/doctors?status=...Returns a flat (non-paginated) array of merged user+doctorDetails objects.*/
  getDoctors: (status?:DoctorApprovalStatus | ""): Promise<GetDoctorsResponse> =>{
    const params : Record<string,string> = {};
    if(status) params.status = status;
    return fetchClient.get("/admin/doctors", { params });
  },

  getPendingDoctors: (startDate?: string, endDate?: string): Promise<GetPendingDoctorsResponse> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return fetchClient.get("/admin/doctors/pending", { params });
  },

  /** PATCH /admin/:id/activate  → sets status: "active"  */
  activateUser: (id: string) =>
    fetchClient.request(`/admin/${id}/activate`, { method: "PATCH" }),

  /** PATCH /admin/:id/deactivate → sets status: "blocked" */
  deactivateUser: (id: string) =>
    fetchClient.request(`/admin/${id}/deactivate`, { method: "PATCH" }),

  /** GET /admin/doctors/pending-licenses → doctors with pending license updates */
  getPendingLicenseDoctors: (): Promise<{ data: PendingLicenseDoctor[] }> =>
    fetchClient.get("/admin/doctors/pending-licenses"),

  /** PATCH /admin/doctors/:id/approve-license */
  approveDoctorLicense: (id: string) =>
    fetchClient.request(`/admin/doctors/${id}/approve-license`, { method: "PATCH" }),

  /** PATCH /admin/doctors/:id/reject-license */
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
