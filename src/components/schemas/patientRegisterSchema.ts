
import * as Yup from 'yup';

export const patientRegisterSchema = Yup.object({
  fullName: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Full name is required'),
    
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
    
  phoneNumber: Yup.string()
    .matches(/^(010|011|012|015)[0-9]{8}$/, "Phone number must be a valid Egyptian mobile number (e.g. 010xxxxxxxx)")
    .required("Phone number is required"),
    
  password: Yup.string()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
    .required("Password is required"),
    
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
    
  dateOfBirth: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
    
  gender: Yup.string()
    .oneOf(['male', 'female'], 'Invalid gender')
    .required('Gender is required'),
    
  bloodType: Yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Invalid blood type')
    .optional(),
    
  address: Yup.string().optional(),

  governorate: Yup.string()
    .required('Governorate is required'),
});