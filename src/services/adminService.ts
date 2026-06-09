import { fetchClient } from "@/services/fetchClient";
import { GetUsersParams, GetUsersResponse } from "@/types/user";

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
