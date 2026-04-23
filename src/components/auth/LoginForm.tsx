"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

// ========== Validation Schema ==========
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

type LoginValues = typeof initialValues;

// ========== Component ==========
export const LoginForm = () => {
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    try {
      console.log("Login:", values, "Role:", role);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/40"
        style={{
          backdropFilter: "blur(24px)",
          background: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {/* ---- Role Selector ---- */}
        <div className="mb-10">
          <label className="block text-center text-xs font-bold tracking-widest uppercase text-[hsl(var(--color-text-muted))] mb-6">
            Identify Your Role
          </label>
          <div
            className="flex p-1.5 rounded-full w-full max-w-sm mx-auto"
            style={{ backgroundColor: "hsl(var(--color-bg-soft))" }}
          >
                {/* Doctor Button */}
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className="flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                  style={
                    role === "doctor"
                      ? {
                          background: "white",
                          color: "hsl(var(--color-primary-strong))",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        }
                      : { color: "hsl(var(--color-text-muted))" }
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Doctor
                </button>
                
            {/* Patient Button */}
            <button
              type="button"
              onClick={() => setRole("patient")}
              className="flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
              style={
                role === "patient"
                  ? {
                      background: "white",
                      color: "hsl(var(--color-primary-strong))",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    }
                  : { color: "hsl(var(--color-text-muted))" }
              }
            >
              <svg
                className="w-4 h-4"
                fill={role === "patient" ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Patient
            </button>

          </div>
        </div>

        {/* ---- Form Header ---- */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl font-bold"
            style={{ color: "hsl(var(--color-text))" }}
          >
            Welcome Back
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "hsl(var(--color-text-muted))" }}
          >
            Access your {role === "doctor" ? "clinical" : "personal"} sanctuary
            portal
          </p>
        </div>

        {/* ---- Formik Form ---- */}
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}
                >
                   Email
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <Field
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                    style={{
                      backgroundColor:
                        errors.email && touched.email
                          ? "#fff5f5"
                          : "hsl(var(--color-bg-soft))",
                      border:
                        errors.email && touched.email
                          ? "1.5px solid #fc8181"
                          : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }}
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-red-500 text-xs pl-4 font-medium"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}
                >
                  Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                    style={{
                      backgroundColor:
                        errors.password && touched.password
                          ? "#fff5f5"
                          : "hsl(var(--color-bg-soft))",
                      border:
                        errors.password && touched.password
                          ? "1.5px solid #fc8181"
                          : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
                    style={{}}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-red-500 text-xs pl-4 font-medium"
                />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between px-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-md border-slate-300"
                    style={{ accentColor: "hsl(var(--color-primary))" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    Stay Signed In
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs font-bold transition-colors"
                  style={{ color: "hsl(var(--color-primary-strong))" }}
                >
                  Forgot Access?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage:
                      role === "doctor"
                        ? "linear-gradient(to right, #0891B2, hsl(var(--color-primary)))"
                        : "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Enter Sanctuary
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-slate-200/50 text-center">
          <p className="text-sm" style={{ color: "hsl(var(--color-text-muted))" }}>
            New to Carehub?{" "}
            <a
              href="#"
              className="font-bold hover:underline underline-offset-4 transition-all"
              style={{ color: "hsl(var(--color-primary-strong))" }}
            >
              Request Enrollment
            </a>
          </p>
        </div>
      </div>

      {/* Security Tag */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: "hsl(var(--color-text-muted))" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span
          className="text-[10px] uppercase font-bold tracking-[0.2em]"
          style={{ color: "hsl(var(--color-text-muted))" }}
        >
          HIPAA COMPLIANT ENVIRONMENT
        </span>
      </div>
    </div>
  );
};
