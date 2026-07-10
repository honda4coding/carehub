// schemas/auth.schema.ts
import * as Yup from "yup";

// ========== Login Validation ==========
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean().default(false),
});

export const loginInitialValues = {
  email: "",
  password: "",
  rememberMe: false,
};

export type LoginValues = typeof loginInitialValues;