export interface GetDashboardData {
  message: string;
  data: {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    pendingDoctors: number;
    totalPrescriptions: number;
    totalMedicalHistories: number;
  };
}