
import * as Yup from 'yup';

export const patientRegisterSchema = Yup.object({
  fullName: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full name is required'),
    
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
    
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits')
    .required('Phone number is required'),
    
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
    
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
    
  age: Yup.number()
    .min(0, 'Invalid age')
    .max(120, 'Invalid age')
    .required('Age is required'),
    
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Invalid gender')
    .required('Gender is required'),
    
  bloodType: Yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Invalid blood type')
    .optional(),
    
  address: Yup.string().optional(),
});