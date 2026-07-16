// components/schemas/doctorRegisterSchema.ts
import * as Yup from "yup";

export const doctorRegisterSchema = Yup.object({
  fullName: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Full name is required"),

  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  phoneNumber: Yup.string()
    .matches(/^(010|011|012|015)[0-9]{8}$/, "Phone number must be a valid Egyptian mobile number (e.g. 010xxxxxxxx)")
    .required("Phone number is required"),

  nationalId: Yup.mixed()
    .required("National ID image is required")
    .test("fileSize", "File too large (max 5MB)", (value) => {
      if (!value) return true;
      return (value as File).size <= 5 * 1024 * 1024;
    }),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Missing a lowercase letter")
    .matches(/[A-Z]/, "Missing an uppercase letter")
    .matches(/\d/, "Missing a number")
    .matches(/[@$!%*?&#]/, "Missing a special character (@$!%*?&#)")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),

  specialty: Yup.string().required("Specialty is required"),

  syndicateId: Yup.number()
    .typeError("Must be numbers only")
    .positive("Invalid syndicate ID")
    .required("Syndicate ID is required"),

  licenseImage: Yup.mixed()
    .required("License image is required")
    .test("fileSize", "File too large (max 5MB)", (value) => {
      if (!value) return true;
      return (value as File).size <= 5 * 1024 * 1024;
    }),

  address: Yup.string().optional(),
});
