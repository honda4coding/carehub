

/**
 * TODO: nermen (Task 1: Auth Pages Setup - Forgot Password Request)
 * 
 * Target URL: /forgot-password
 * 
 * Tasks to achieve here:
 * 1. Build Forgot Password UI using Formik and Yup validation.
 * 2. Add email input field with standard email validation rules.
 * 3. Connect onSubmit action to Backend:
 *    - Route: PATCH /users/forget-password
 *    - Body: { email }
 * 4. Redirect on success to `/verify-otp` so the user can verify the recovery code.
 */
"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { LuMail } from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
import { LuLoader } from "react-icons/lu";
import * as Yup from "yup";

import { fetchClient } from "@/services/fetchClient";

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState("");

  const handleSubmit = async (
    values: ForgotPasswordValues,
    { setSubmitting }: FormikHelpers<ForgotPasswordValues>
  ) => {
    try {
      await fetchClient.patch("/users/forget-password", { email: values.email });
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=reset`);
    } catch (err: any) {
      if (err.message?.includes("already have otp")) {
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=reset`);
        return;
      }
      setServerError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    
      <AuthCard>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
            Forgot Password
          </h2>
          <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-2">
            Enter your email to receive a recovery code.
          </p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="bg-danger-light border border-red-200 text-danger text-sm font-medium px-4 py-3 rounded-2xl text-center mb-4">
            {serverError}
          </div>
        )}

        <Formik
          initialValues={{ email: "" }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold pl-4 tracking-wide uppercase"
                  style={{ color: "hsl(var(--color-text-muted))" }}
                >
                  Email
                </label>
                <div className="relative">
                  <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all placeholder:text-slate-300"
                    style={{
                      backgroundColor: errors.email && touched.email ? "#fff5f5" : "white",
                      border: errors.email && touched.email
                        ? "1.5px solid #fc8181"
                        : "1.5px solid transparent",
                      color: "hsl(var(--color-text))",
                    }}
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-danger text-xs pl-4 font-medium"
                />
              </div>

              {/* Submit */}
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
                    <LuLoader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Recovery Code
                    <LuArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </Form>
          )}
        </Formik>

      </AuthCard>
  );
}

