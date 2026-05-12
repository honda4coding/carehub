"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiShieldCheck } from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import RoleSelector from "./RoleSelector";
import { loginSchema, loginInitialValues, type LoginValues } from "../schemas/loginSchema";






// ========== Component ==========
export const LoginForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFromUrl = searchParams.get("role");
  const { login } = useAuth(); // Get login function from AuthContext

  const [role, setRole] = useState<"patient" | "doctor">(roleFromUrl === "patient" ? "patient" : "doctor");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (roleFromUrl === "patient" || roleFromUrl === "doctor") {
      setRole(roleFromUrl as "doctor" | "patient");
    }
  }, [roleFromUrl]);

  const handleRoleChange = (newRole: "doctor" | "patient") => {
    setRole(newRole);
    router.push(`/login?role=${newRole}`, { scroll: false });
  };

  /**
   * MEMBER 5 (Logic Engineer) - TASK: Login Integration
   * ---------------------------------------------------
   * 1. Connect this form to your backend Login API.
   * 2. Handle the authentication response and update the global Auth state.
   * 3. Implement error handling for invalid credentials.
   */
  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    try {
      // MEMBER 5 (Logic Engineer) - SIMULATED LOGIN
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the login function which sets cookies and redirects
      login("simulated_auth_token", role, {
        id: "mock_id_123",
        email: values.email,
        name: role.charAt(0).toUpperCase() + role.slice(1) + " Test User",
      });
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/40 shadow-xl"
        style={{
          backdropFilter: "blur(24px)",
          background: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {/* ---- Role Selector ---- */}
        <RoleSelector selectedRole={role} onRoleChange={handleRoleChange} />

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
          initialValues={loginInitialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
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
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    style={{
                      backgroundColor:
                        errors.email && touched.email
                          ? "#fff5f5"
                          : "white",
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
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    style={{
                      backgroundColor:
                        errors.password && touched.password
                          ? "#fff5f5"
                          : "white",
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
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
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
                      <ImSpinner2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Enter Sanctuary
                      <HiOutlineArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-slate-200/50 text-center space-y-4">
          <p className="text-sm" style={{ color: "hsl(var(--color-text-muted))" }}>
            New to Carehub?{" "}
            <Link
              href="/register"
              className="font-bold hover:underline underline-offset-4 transition-all"
              style={{ color: "hsl(var(--color-primary-strong))" }}
            >
              Request Enrollment
            </Link>
          </p>
        </div>
      </div>

      {/* Security Tag */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <HiShieldCheck
          className="w-4 h-4"
          style={{ color: "hsl(var(--color-text-muted))" }}
        />
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

