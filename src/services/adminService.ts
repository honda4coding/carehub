import { fetchClient } from "@/services/fetchClient";
import { GetUsersParams, GetUsersResponse } from "@/types/user";

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
    return fetchClient.get("/admin/users", { method: "GET" , params: query });
  },

  /** PATCH /admin/:id/activate  → sets status: "active"  */
  activateUser: (id: string) =>
    fetchClient.request(`/admin/${id}/activate`, { method: "PATCH" }),

  /** PATCH /admin/:id/deactivate → sets status: "blocked" */
  deactivateUser: (id: string) =>
    fetchClient.request(`/admin/${id}/deactivate`, { method: "PATCH" }),
};
