
export interface PatientFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  age: number;
  gender: 'male' | 'female';
  bloodType: string;
  address: string;
}