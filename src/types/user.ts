export type UserRole = "admin" | "doctor" | "patient";
export type UserStatus = "active" | "pending" | "blocked" | "rejected";

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  confirmed: boolean;
  address?: string;
  profilepicture?: {
    secure_url: string;
    public_id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UsersPagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface GetUsersResponse {
  message: string;
  data: {
    users: AdminUser[];
    pagination: UsersPagination;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole | "",
  status?: UserStatus | ""
}
