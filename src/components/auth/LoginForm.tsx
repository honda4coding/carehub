"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiShieldCheck, HiOutlineX } from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import RoleSelector from "./RoleSelector";
import { loginSchema, loginInitialValues, type LoginValues } from "../schemas/loginSchema";
import * as Yup from "yup";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ========== Forgot Password Modal ==========
const ForgotPasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const step1Schema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const step2Schema = Yup.object({
    code: Yup.string().min(6, "OTP must be 6 characters").required("OTP is required"),
    newpassword: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    cpassword: Yup.string()
      .oneOf([Yup.ref("newpassword")], "Passwords must match")
      .required("Confirm password is required"),
  });
  

  const handleStep1 = async (
    values: { email: string },
    { setSubmitting }: FormikHelpers<{ email: string }>
  ) => {
    try {
      setModalError("");
      const response = await fetch(`${BASE_URL}/users/forget-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setModalError(data.message || "Something went wrong.");
        return;
      }
      setEmail(values.email);
      setStep(2);
    } catch {
      setModalError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2 = async (
    values: { code: string; newpassword: string; cpassword: string },
    { setSubmitting }: FormikHelpers<{ code: string; newpassword: string; cpassword: string }>
  ) => {
    try {
      setModalError("");
      const response = await fetch(`${BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: values.code,
          newpassword: values.newpassword,
          cpassword: values.cpassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setModalError(data.message || "Something went wrong.");
        return;
      }
      setModalSuccess("Password reset successfully! You can now login.");
      setTimeout(() => onClose(), 2000);
    } catch {
      setModalError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-[2rem] p-8 relative border border-white/40 shadow-xl"
        style={{ backdropFilter: "blur(24px)", background: "rgba(255,255,255,0.95)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <HiOutlineX className="w-5 h-5 text-slate-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: "hsl(var(--color-text))" }}>
            {step === 1 ? "Forgot Access?" : "Reset Password"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--color-text-muted))" }}>
            {step === 1
              ? "Enter your email to receive an OTP"
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: "hsl(var(--color-primary))" }}>1</div>
          <div className="w-8 h-0.5" style={{ backgroundColor: step === 2 ? "hsl(var(--color-primary))" : "#e2e8f0" }} />
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: step === 2 ? "hsl(var(--color-primary))" : "#e2e8f0",
              color: step === 2 ? "white" : "hsl(var(--color-text-muted))"
            }}>2</div>
        </div>

        {/* Error / Success */}
        {modalError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
            {modalError}
          </div>
        )}
        {modalSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
            {modalSuccess}
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <Formik initialValues={{ email: "" }} validationSchema={step1Schema} onSubmit={handleStep1}>
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}>Email</label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Field name="email" type="email" placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                      style={{
                        backgroundColor: errors.email && touched.email ? "#fff5f5" : "white",
                        border: errors.email && touched.email ? "1.5px solid #fc8181" : "1.5px solid transparent",
                        color: "hsl(var(--color-text))",
                      }} />
                  </div>
                  <ErrorMessage name="email" component="p" className="text-red-500 text-xs pl-4 font-medium" />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundImage: "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))" }}>
                  {isSubmitting ? <><ImSpinner2 className="w-5 h-5 animate-spin" /> Sending...</> : <>Send OTP <HiOutlineArrowRight className="w-5 h-5" /></>}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <Formik initialValues={{ code: "", newpassword: "", cpassword: "" }} validationSchema={step2Schema} onSubmit={handleStep2}>
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                {/* OTP */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}>OTP Code</label>
                  <Field name="code" type="text" placeholder="123456"
                    className="w-full px-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm text-center tracking-widest font-bold"
                    style={{
                      backgroundColor: errors.code && touched.code ? "#fff5f5" : "white",
                      border: errors.code && touched.code ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }} />
                  <ErrorMessage name="code" component="p" className="text-red-500 text-xs pl-4 font-medium" />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}>New Password</label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Field name="newpassword" type="password" placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                      style={{
                        backgroundColor: errors.newpassword && touched.newpassword ? "#fff5f5" : "white",
                        border: errors.newpassword && touched.newpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                        color: "hsl(var(--color-text))",
                      }} />
                  </div>
                  <ErrorMessage name="newpassword" component="p" className="text-red-500 text-xs pl-4 font-medium" />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}>Confirm Password</label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Field name="cpassword" type="password" placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                      style={{
                        backgroundColor: errors.cpassword && touched.cpassword ? "#fff5f5" : "white",
                        border: errors.cpassword && touched.cpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                        color: "hsl(var(--color-text))",
                      }} />
                  </div>
                  <ErrorMessage name="cpassword" component="p" className="text-red-500 text-xs pl-4 font-medium" />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundImage: "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))" }}>
                  {isSubmitting ? <><ImSpinner2 className="w-5 h-5 animate-spin" /> Resetting...</> : <>Reset Password <HiOutlineArrowRight className="w-5 h-5" /></>}
                </button>

                <button type="button" onClick={() => { setStep(1); setModalError(""); }}
                  className="w-full py-2 text-sm font-medium transition-colors"
                  style={{ color: "hsl(var(--color-text-muted))" }}>
                  ← Back
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

// ========== Component ==========
export const LoginForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFromUrl = searchParams.get("role");
  const { login } = useAuth();

  const [role, setRole] = useState<"patient" | "doctor">(roleFromUrl === "patient" ? "patient" : "doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (roleFromUrl === "patient" || roleFromUrl === "doctor") {
      setRole(roleFromUrl as "doctor" | "patient");
    }
  }, [roleFromUrl]);

  const handleRoleChange = (newRole: "doctor" | "patient") => {
    setRole(newRole);
    router.push(`/login?role=${newRole}`, { scroll: false });
  };

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginValues>
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.message || "Invalid credentials. Please try again.");
        return;
      }

      login(data.data.access_token, role, {
        id: data.data.id,
        email: values.email,
        name: values.email,
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
      {/* Forgot Password Modal */}
      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}

      <div
        className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-white/40 shadow-xl"
        style={{ backdropFilter: "blur(24px)", background: "rgba(255, 255, 255, 0.7)" }}
      >
        <RoleSelector selectedRole={role} onRoleChange={handleRoleChange} />

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--color-text))" }}>
            Welcome Back
          </h2>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--color-text-muted))" }}>
            Access your {role === "doctor" ? "clinical" : "personal"} sanctuary portal
          </p>
        </div>

        <Formik
          initialValues={loginInitialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form className="space-y-5">

              {status && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl text-center">
                  {status}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}>Email</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field name="email" type="email" placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    style={{
                      backgroundColor: errors.email && touched.email ? "#fff5f5" : "white",
                      border: errors.email && touched.email ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }} />
                </div>
                <ErrorMessage name="email" component="p" className="text-red-500 text-xs pl-4 font-medium" />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}>Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field name="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    style={{
                      backgroundColor: errors.password && touched.password ? "#fff5f5" : "white",
                      border: errors.password && touched.password ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors">
                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="text-red-500 text-xs pl-4 font-medium" />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between px-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300"
                    style={{ accentColor: "hsl(var(--color-primary))" }} />
                  <span className="text-xs font-medium" style={{ color: "hsl(var(--color-text-muted))" }}>
                    Stay Signed In
                  </span>
                </label>
                {/* ✅ دي دلوقتي بتفتح الـ Modal */}
                <button type="button" onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold transition-colors"
                  style={{ color: "hsl(var(--color-primary-strong))" }}>
                  Forgot Access?
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: role === "doctor"
                      ? "linear-gradient(to right, #0891B2, hsl(var(--color-primary)))"
                      : "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))",
                  }}>
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
            <Link href="/register"
              className="font-bold hover:underline underline-offset-4 transition-all"
              style={{ color: "hsl(var(--color-primary-strong))" }}>
              Request Enrollment
            </Link>
          </p>
        </div>
      </div>

      {/* Security Tag */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <HiShieldCheck className="w-4 h-4" style={{ color: "hsl(var(--color-text-muted))" }} />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]"
          style={{ color: "hsl(var(--color-text-muted))" }}>
          HIPAA COMPLIANT ENVIRONMENT
        </span>
      </div>
    </div>
  );
};