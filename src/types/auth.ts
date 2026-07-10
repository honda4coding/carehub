export interface User {
  id: string;
  email: string;
  name: string;
  permissions?: {
    canManageAppointments: boolean;
    canManagePatientsVitals: boolean;
    canManagePatientsFull: boolean;
    canManagePatients?: boolean; // Backward compatibility fallback
    canManageBilling: boolean;
    canManageReports: boolean;
  };
  doctorId?: string;
  jobTitle?: string;
  doctorName?: string;
  clinicId?: string;
  clinicName?: string;
  profilepicture?: { secure_url: string; public_id: string };
  subscriptionPlan?: string;
  subscriptionFeatures?: { code: string; name: string; enabled: boolean }[];
  clinicLimit?: number;
}

export interface AuthContextType {
  user: User | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (partialUser: Partial<User>) => void;
}
