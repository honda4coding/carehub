
export interface DoctorFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: File | null;
  password: string;
  confirmPassword: string;
  specialty: string;
  syndicateId: number;
  licenseImage: File | null;
  address: string;
}

export type DoctorApprovalStatus = "pending" | "approved" | "rejected";

export interface PendingDoctorRequest  {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: DoctorApprovalStatus;
  address?: string;
  createdAt: string;
  specialty?: string;
  licenseUrl?: string;
}

export interface GetPendingDoctorsResponse {
  message?: string,
  data: PendingDoctorRequest[];
}

export interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: DoctorApprovalStatus;
  address?: string;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
  licenseUrl: string | null;
  nationalIdUrl: string | null;
  specialty: string | null;
}

export interface GetDoctorsResponse {
  message?: string;
  data: Doctor[];
}