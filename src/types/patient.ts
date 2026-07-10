
export interface PatientFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodType: string;
  governorate: string;
  address: string;
}

export interface HealthHubProfile {
  fullName: string;
  nationalIdStatus: "Verified" | "Pending";
  bloodType: string;
  chronicDiseases: string[];
  allergies: string[];
  age?: number;
  dateOfBirth?: string;
  gender: "Male" | "Female";
  governorate?: string;
  address: string;
  phoneNumber: string;
  height?: number;
  weight?: number;
  surgeries?: string[];
  profilepicture?: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

export interface TimelineEntry {
  id: string;
  rawDate: Date;
  date: string;
  doctorName: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  prescriptions: Prescription[];
  clinicalNotes: string;
  rawRecord?: any;
}