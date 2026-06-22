export interface GetDashboardData {
  message: string;
  data: {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    pendingDoctors: number;
    rejectedDoctors?: number;
    totalPrescriptions: number;
    totalMedicalHistories: number;
    totalAppointments: number;
  };
}

export interface MonthlyStats {
  month: string;
  usersCount: number;
  appointmentsCount: number;
}

export interface DailyStats {
  date: string;
  patientsCount: number;
  doctorsCount: number;
  appointmentsCount: number;
}

export interface AnalyticsData {
  chartData: {
    label: string;
    usersCount: number;
    appointmentsCount: number;
  }[];
  summary: {
    totalAppointments: number;
    totalPrescriptions: number;
    totalMedicalHistories: number;
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
  };
  doctorsBySpecialty: {
    name: string;
    value: number;
  }[];
}