"use client";

import { useState } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useAuth } from "@/context/AuthContext";
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye,
  HiOutlineEyeOff, HiShieldCheck,
} from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import {
  loginSchema,
  loginInitialValues,
  type LoginValues,
} from "../schemas/loginSchema";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const LoginForm = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginValues>,
  ) => {
    try {
      // 1. signin
      const response = await fetch(`${BASE_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.message || "Invalid credentials. Please try again.");
        return;
      }

      const actualRole = data.data.role?.toLowerCase();

      if (!actualRole) {
        setStatus("Unable to determine account role. Please contact support.");
        return;
      }

      login(data.data.access_token, actualRole, {
        id: data.data.id,
        email: values.email,
        name: data.data.name || values.email,
      });

    } catch (error) {
      setStatus("Something went wrong. Please check your connection.");
      console.error("Login Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/40 shadow-xl"
        style={{ backdropFilter: "blur(24px)", background: "rgba(255, 255, 255, 0.7)" }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--color-text))" }}>
            Welcome Back
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "hsl(var(--color-text-muted))" }}
          >
            Sign in to your account
          </p>
        </div>

        <Formik
          initialValues={loginInitialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form className="space-y-5">
              {status && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl text-center">
                  {status}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase" style={{ color: "hsl(var(--color-text-muted))" }}>
                  Email
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field
                    name="email" type="email" placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    style={{
                      backgroundColor: errors.email && touched.email ? "#fff5f5" : "white",
                      border: errors.email && touched.email ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }}
                  />
                </div>
                <ErrorMessage name="email" component="p" className="text-red-500 text-xs pl-4 font-medium" />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase" style={{ color: "hsl(var(--color-text-muted))" }}>
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field
                    name="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    style={{
                      backgroundColor: errors.password && touched.password ? "#fff5f5" : "white",
                      border: errors.password && touched.password ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors">
                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="text-red-500 text-xs pl-4 font-medium" />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between px-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
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
                <div className="flex items-center gap-4">
                  <Link href="/forgot-password" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--color-primary-strong))" }}>Forgot Access?</Link>
                  <Link href="/reset-password" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--color-primary-strong))" }}>Reset Password</Link>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #0891B2, hsl(var(--color-primary)))",
                  }}
                >
                  {isSubmitting ? (
                    <><ImSpinner2 className="w-5 h-5 animate-spin" /> Verifying...</>
                  ) : (
                    <>Enter Sanctuary <HiOutlineArrowRight className="w-5 h-5" /></>
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
            <Link href="/register" className="font-bold hover:underline underline-offset-4 transition-all" style={{ color: "hsl(var(--color-primary-strong))" }}>
              Request Enrollment
            </Link>
          </p>

          <p
            className="text-sm"
            style={{ color: "hsl(var(--color-text-muted))" }}
          >
            Received an OTP from admin?{" "}
            <Link
              href="/verify-otp?type=confirm"
              className="font-bold hover:underline underline-offset-4 transition-all"
              style={{ color: "hsl(var(--color-primary-strong))" }}
            >
              Verify here
            </Link>
          </p>
        </div>
      </div>

      {/* Security Tag */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <HiShieldCheck className="w-4 h-4" style={{ color: "hsl(var(--color-text-muted))" }} />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: "hsl(var(--color-text-muted))" }}>
          HIPAA COMPLIANT ENVIRONMENT
        </span>
      </div>
    </div>
  );
};
