// schemas/auth.schema.ts
import * as Yup from "yup";

// ========== Login Validation ==========
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
});

export const loginInitialValues = {
  email: "",
  password: "",
};

export type LoginValues = typeof loginInitialValues;