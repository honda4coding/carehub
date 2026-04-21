
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