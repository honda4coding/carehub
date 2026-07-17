/**
 * TODO: Nermen (Task 1: Auth Pages Setup - OTP Verification)
 *
 * Target URL: /verify-otp
 *
 * Tasks to achieve here:
 * 1. Implement segmented numeric inputs (e.g., 4 or 6 boxes).
 * 2. Handlers to shift focus between input segments automatically as user types.
 * 3. Form validation to ensure numeric-only characters.
 * 4. Wire the verify trigger to the Backend PATCH request:
 *    - Route: /users/confirm-email (if verify sign-up)
 *    - Route: /users/reset-password (verify forget-password OTP verification)
 * 5. Handle success/error states with user-friendly alerts.
 */

"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { LuLock } from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
import { LuLoader } from "react-icons/lu";
import * as Yup from "yup";
import { Suspense } from "react";

import { fetchClient } from "@/services/fetchClient";

// ========== Schemas ==========
const confirmSchema = Yup.object({
  code: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const resetSchema = Yup.object({
  code: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
  newpassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  cpassword: Yup.string()
    .oneOf([Yup.ref("newpassword")], "Passwords must match")
    .required("Confirm password is required"),
});

// ========== Main Content ==========
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [emailInput, setEmailInput] = React.useState(email);
  const type = searchParams.get("type") || "confirm"; // "confirm" | "reset"

  const [serverError, setServerError] = React.useState("");
  const [serverSuccess, setServerSuccess] = React.useState("");

  const isReset = type === "reset";

  const handleConfirm = async (
    values: { code: string },
    { setSubmitting }: FormikHelpers<{ code: string }>,
  ) => {
    try {
      setServerError("");
      await fetchClient.patch("/users/confirm-email", { email: emailInput, code: values.code });
      setServerSuccess("Email confirmed! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (
    values: { code: string; newpassword: string; cpassword: string },
    {
      setSubmitting,
    }: FormikHelpers<{ code: string; newpassword: string; cpassword: string }>,
  ) => {
    try {
      setServerError("");
      await fetchClient.patch("/users/reset-password", {
        email: emailInput,
        code: values.code,
        newpassword: values.newpassword,
        cpassword: values.cpassword,
      });
      setServerSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };
//////////////////////for resend otp 
const [countdown, setCountdown] = React.useState(0);
const [resendSuccess, setResendSuccess] = React.useState("");
const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

const handleResend = async () => {
  try {
    setServerError("");
    setResendSuccess("");

    const url = isReset ? "/users/forget-password" : "/users/resend-otp";
    const method = isReset ? "PATCH" : "POST";

    await fetchClient.request(url, {
      method,
      data: { email: emailInput },
    });
    setResendSuccess("OTP resent! Check your email.");
    setCountdown(60);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } catch (err: any) {
    setServerError(err.message || "Something went wrong.");
  }
};


React.useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);

  return (
    
      <AuthCard>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
            {isReset ? "Reset Password" : "Verify Your Email"}
          </h2>
          <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-2">
            {isReset
              ? `Enter the OTP sent to ${emailInput} and set your new password.`
              : email
                ? `Enter the OTP sent to ${email} to confirm your account.`
                : `Enter your email and the OTP sent to you to confirm your account.`}
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

        {/* Confirm Email Form */}
        {!isReset && (
          <Formik
            initialValues={{ code: "" }}
            validationSchema={confirmSchema}
            onSubmit={handleConfirm}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                {/* Ã¢Å“â€¦ Email field - Ã˜Â¨Ã™Å Ã˜Â¸Ã™â€¡Ã˜Â± Ã˜Â¨Ã˜Â³ Ã™â€žÃ™Ë† Ã™â€¦Ã™ÂÃ™Å Ã˜Â´ email Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â‚¬ URL (Ã™Å Ã˜Â¹Ã™â€ Ã™Å  Ã˜Â§Ã™â€žÃ˜Â¯Ã™Æ’Ã˜ÂªÃ™Ë†Ã˜Â± Ã˜Â¬Ã˜Â§Ã™Å  Ã™â€¦Ã™â€  login) */}
                {!email && (
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-bold pl-4 tracking-wide uppercase"
                      style={{ color: "hsl(var(--color-text-muted))" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                      style={{
                        border: "1.5px solid transparent",
                        backgroundColor: "white",
                        color: "#0f172a",
                      }}
                    />
                  </div>
                )}

                {/* OTP */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    OTP Code
                  </label>
                  <Field
                    name="code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 text-center tracking-widest font-bold text-lg"
                    style={{
                      backgroundColor:
                        errors.code && touched.code ? "#fff5f5" : "white",
                      border:
                        errors.code && touched.code
                          ? "1.5px solid #fc8181"
                          : "1.5px solid transparent",
                      color: "#0f172a",
                    }}
                  />
                  <ErrorMessage
                    name="code"
                    component="p"
                    className="text-danger text-xs pl-4 font-medium"
                  />
                </div>

                {/* Resend OTP */}
                  {resendSuccess && (
                    <p className="text-success text-xs text-center font-medium">{resendSuccess}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="w-full py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <LuLoader className="w-5 h-5 animate-spin" />{" "}
                      Verifying...
                    </>
                  ) : (
                    <>
                      Confirm Email <LuArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* Reset Password Form */}
        {isReset && (
          <Formik
            initialValues={{ code: "", newpassword: "", cpassword: "" }}
            validationSchema={resetSchema}
            onSubmit={handleReset}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-4">
                {/* Email field - Ã˜Â¨Ã™Å Ã˜Â¸Ã™â€¡Ã˜Â± Ã˜Â¨Ã˜Â³ Ã™â€žÃ™Ë† Ã™â€¦Ã™ÂÃ™Å Ã˜Â´ email Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â‚¬ URL */}
                {!email && (
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-bold pl-4 tracking-wide uppercase"
                      style={{ color: "hsl(var(--color-text-muted))" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                      style={{
                        border: "1.5px solid transparent",
                        backgroundColor: "white",
                        color: "#0f172a",
                      }}
                    />
                  </div>
                )}

                {/* OTP */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    OTP Code
                  </label>
                  <Field
                    name="code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300 text-center tracking-widest font-bold text-lg"
                    style={{
                      backgroundColor:
                        errors.code && touched.code ? "#fff5f5" : "white",
                      border:
                        errors.code && touched.code
                          ? "1.5px solid #fc8181"
                          : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }}
                  />
                  <ErrorMessage
                    name="code"
                    component="p"
                    className="text-danger text-xs pl-4 font-medium"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Field
                      name="newpassword"
                      type="password"
                      placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                      style={{
                        backgroundColor:
                          errors.newpassword && touched.newpassword
                            ? "#fff5f5"
                            : "white",
                        border:
                          errors.newpassword && touched.newpassword
                            ? "1.5px solid #fc8181"
                            : "1.5px solid transparent",
                        color: "#0f172a",
                      }}
                    />
                  </div>
                  <ErrorMessage
                    name="newpassword"
                    component="p"
                    className="text-danger text-xs pl-4 font-medium"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold pl-4 tracking-wide uppercase"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Field
                      name="cpassword"
                      type="password"
                      placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                      style={{
                        backgroundColor:
                          errors.cpassword && touched.cpassword
                            ? "#fff5f5"
                            : "white",
                        border:
                          errors.cpassword && touched.cpassword
                            ? "1.5px solid #fc8181"
                            : "1.5px solid transparent",
                        color: "#0f172a",
                      }}
                    />
                  </div>
                  <ErrorMessage
                    name="cpassword"
                    component="p"
                    className="text-danger text-xs pl-4 font-medium"
                  />
                </div>
                
                {/* Resend OTP */}
                {resendSuccess && (
                  <p className="text-success text-xs text-center font-medium">{resendSuccess}</p>
                )}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className="w-full py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "hsl(var(--color-text-muted))" }}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, hsl(var(--color-secondary)), hsl(var(--color-primary)))",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <LuLoader className="w-5 h-5 animate-spin" />{" "}
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password <LuArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="w-full py-2 text-sm font-medium transition-colors"
                  style={{ color: "hsl(var(--color-text-muted))" }}
                >
                  Ã¢â€ Â Back
                </button>
              </Form>
            )}
          </Formik>
        )}
      </AuthCard>
  );
}



// ========== Page ==========
export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center font-medium mt-10 text-[hsl(var(--color-primary))]">
          Loading...
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

