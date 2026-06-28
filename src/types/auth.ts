export interface User {
  id: string;
  email: string;
  name: string;
  permissions?: {
    canManageAppointments: boolean;
    canManagePatients: boolean;
    canManageBilling: boolean;
  };
  doctorId?: string;
}

export interface AuthContextType {
  user: User | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: string, user: User) => void;
  logout: () => void;
}
