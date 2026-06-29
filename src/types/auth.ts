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
