

/**
 * TODO: DALIA (Task 1: Auth Pages Setup - Reset Password)
 * 
 * Target URL: /reset-password
 * 
 * Tasks to achieve here:
 * 1. Build Reset Password UI with fields for email, OTP code, new password, and password confirmation.
 * 2. Setup Yup validations:
 *    - Password must be at least 6 characters.
 *    - Confirmation must match the password field exactly.
 * 3. Connect onSubmit to Backend:
 *    - Route: POST /users/reset-password
 *    - Body: { email, code: otpCode, newpassword }
 * 4. Redirect upon success to `/login` with success banner.
 */

// app/reset-password/page.tsx
"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { LuMail, LuLock } from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
import { LuLoader } from "react-icons/lu";
import * as Yup from "yup";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const resetPasswordSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  code: Yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
  newpassword: Yup.string().min(8, "Password must be at least 6 characters").required("Password is required"),
  cpassword: Yup.string()
    .oneOf([Yup.ref("newpassword")], "Passwords must match")
    .required("Confirm password is required"),
});

type ResetPasswordValues = {
  email: string;
  code: string;
  newpassword: string;
  cpassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");
  const [serverSuccess, setServerSuccess] = React.useState("");

  // Ø¶ÙŠÙÙŠ state
const [otpSent, setOtpSent] = React.useState(false);
const [sendingOtp, setSendingOtp] = React.useState(false);

const handleSendOtp = async (email: string) => {
  if (!email) return;
  setSendingOtp(true);
  try {
    setServerError("");
    const res = await fetch(`${BASE_URL}/users/forget-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.message || "Something went wrong.");
      return;
    }
    setOtpSent(true);
  } catch {
    setServerError("Something went wrong.");
  } finally {
    setSendingOtp(false);
  }
};

  const handleSubmit = async (
    values: ResetPasswordValues,
    { setSubmitting }: FormikHelpers<ResetPasswordValues>
  ) => {
    try {
      setServerError("");
      const res = await fetch(`${BASE_URL}/users/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          code: values.code,
          newpassword: values.newpassword,
          cpassword: values.cpassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Something went wrong.");
        return;
      }
      setServerSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setServerError("Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    
      <AuthCard>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
            Reset Password
          </h2>
          <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-2">
            Enter your email, OTP code, and new password.
          </p>
        </div>

        {/* Server Messages */}
        {serverError && (
          <div className="bg-danger-light border border-red-200 text-danger text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
            {serverError}
          </div>
        )}
        {serverSuccess && (
          <div className="bg-success-light border border-green-200 text-success text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
            {serverSuccess}
          </div>
        )}

        <Formik
          initialValues={{ email: "", code: "", newpassword: "", cpassword: "" }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}>Email</label>
                <div className="relative">
                  <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field name="email" type="email" placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                    style={{
                      backgroundColor: errors.email && touched.email ? "#fff5f5" : "white",
                      border: errors.email && touched.email ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }} />
                </div>
                <ErrorMessage name="email" component="p" className="text-danger text-xs pl-4 font-medium" />
              </div>

              <button
  type="button"
  disabled={sendingOtp}
  onClick={() => handleSendOtp(values.email)}
  className="w-full py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
  style={{ backgroundImage: "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))" }}
>
  {sendingOtp ? <><LuLoader className="w-4 h-4 animate-spin" /> Sending...</> : "Send OTP"}
</button>

{otpSent && (
  <p className="text-success text-xs text-center font-medium">OTP sent! Check your email.</p>
)}

              {/* OTP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}>OTP Code</label>
                <Field name="code" type="text" placeholder="123456" maxLength={6}
                  className="w-full px-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 text-center tracking-widest font-bold text-lg"
                  style={{
                    backgroundColor: errors.code && touched.code ? "#fff5f5" : "white",
                    border: errors.code && touched.code ? "1.5px solid #fc8181" : "1.5px solid transparent",
                    color: "hsl(var(--color-text))",
                  }} />
                <ErrorMessage name="code" component="p" className="text-danger text-xs pl-4 font-medium" />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}>New Password</label>
                <div className="relative">
                  <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field name="newpassword" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                    style={{
                      backgroundColor: errors.newpassword && touched.newpassword ? "#fff5f5" : "white",
                      border: errors.newpassword && touched.newpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }} />
                </div>
                <ErrorMessage name="newpassword" component="p" className="text-danger text-xs pl-4 font-medium" />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}>Confirm Password</label>
                <div className="relative">
                  <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field name="cpassword" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                    style={{
                      backgroundColor: errors.cpassword && touched.cpassword ? "#fff5f5" : "white",
                      border: errors.cpassword && touched.cpassword ? "1.5px solid #fc8181" : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }} />
                </div>
                <ErrorMessage name="cpassword" component="p" className="text-danger text-xs pl-4 font-medium" />
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundImage: "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))" }}>
                {isSubmitting ? (
                  <><LuLoader className="w-5 h-5 animate-spin" /> Resetting...</>
                ) : (
                  <>Reset Password <LuArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <button type="button" onClick={() => router.push("/forgot-password")}
                className="w-full py-2 text-sm font-medium transition-colors"
                style={{ color: "hsl(var(--color-text-muted))" }}>
                â† Back to Forgot Password
              </button>

            </Form>
          )}
        </Formik>

      </AuthCard>
  );
}

