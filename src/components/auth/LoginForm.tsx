"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FieldProps } from "formik";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  LuMail, LuLock, LuEye,
  LuEyeOff, LuShieldCheck,
} from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
import { LuLoader } from "react-icons/lu";
import { LuFingerprint } from "react-icons/lu";
import { authenticateBiometrics } from "@/services/webAuthnService";
import {
  loginSchema,
  loginInitialValues,
  type LoginValues,
} from "../schemas/loginSchema";
import { fetchClient } from "@/services/fetchClient";

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isBioSubmitting, setIsBioSubmitting] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  const handleBiometricLogin = async (email: string) => {
    if (!email) {
      setBioError("Please enter your email to sign in with biometrics.");
      return;
    }

    try {
      setIsBioSubmitting(true);
      setBioError(null);

      const res = await authenticateBiometrics(email);
      const data = res.data;
      const actualRole = data.role?.toLowerCase();

      if (!actualRole) {
        setBioError("Unable to determine account role. Please contact support.");
        return;
      }

      login(data.access_token, actualRole, {
        id: data.id,
        email: email,
        name: data.fullName || data.name || email,
        permissions: data.permissions,
        doctorId: data.doctorId,
        jobTitle: data.jobTitle,
        doctorName: data.doctorName,
        clinicName: data.clinicName,
        subscriptionPlan: data.subscriptionPlan,
        subscriptionFeatures: data.subscriptionFeatures,
        clinicLimit: data.clinicLimit,
      });
    } catch (err: any) {
      setBioError(err.message || "Biometrics login failed.");
    } finally {
      setIsBioSubmitting(false);
    }
  };

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginValues>,
  ) => {
    try {
      // 1. signin
      const data = await fetchClient.post("/users/signin", {
        email: values.email,
        password: values.password,
      });

      const actualRole = data.data.role?.toLowerCase();

      if (!actualRole) {
        setStatus("Unable to determine account role. Please contact support.");
        return;
      }

      login(data.data.access_token, actualRole, {
        id: data.data.id,
        email: values.email,
        name: data.data.fullName || data.data.name || values.email,
        profilepicture: data.data.profilepicture,
        permissions: data.data.permissions,
        doctorId: data.data.doctorId,
        jobTitle: data.data.jobTitle,
        doctorName: data.data.doctorName,
        clinicName: data.data.clinicName,
        subscriptionPlan: data.data.subscriptionPlan,
        subscriptionFeatures: data.data.subscriptionFeatures,
        clinicLimit: data.data.clinicLimit,
      }, true);

    } catch (error: any) {
      let errorMsg = error.message || "Something went wrong. Please check your connection.";
      if (error.message === "validation error" && Array.isArray(error.error)) {
        errorMsg = error.error.map((e: any) => e.message).join(", ");
      }

      if (errorMsg.includes("please confirm your email first")) {
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=confirm`);
        return;
      }

      setStatus(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <AuthCard>
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
          {({ values, errors, touched, isSubmitting, status }) => (
            <Form className="space-y-5">
              {status && (
                <div className="bg-danger-light border border-red-200 text-danger text-sm font-medium px-4 py-3 rounded-2xl text-center">
                  {status}
                </div>
              )}

              {/* Email */}
              <div>
                <Label>Email</Label>
                <Field name="email">
                  {({ field, meta }: FieldProps) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      leftIcon={<LuMail className="w-5 h-5" />}
                      error={!!(meta.touched && meta.error)}
                    />
                  )}
                </Field>
                <ErrorMessage name="email" component="p" className="text-[hsl(var(--color-danger))] text-xs pl-2 font-bold mt-1" />
              </div>

              {/* Password */}
              <div>
                <Label>Password</Label>
                <Field name="password">
                  {({ field, meta }: FieldProps) => (
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      leftIcon={<LuLock className="w-5 h-5" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-[hsl(var(--color-text))] transition-colors">
                          {showPassword ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                        </button>
                      }
                      error={!!(meta.touched && meta.error)}
                    />
                  )}
                </Field>
                <ErrorMessage name="password" component="p" className="text-[hsl(var(--color-danger))] text-xs pl-2 font-bold mt-1" />
              </div>

              {/* Forgot */}
              <div className="flex justify-end px-2 pt-2">
                <Link href="/forgot-password" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--color-primary-strong))" }}>Forgot Access?</Link>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  icon={LuArrowRight}
                  iconPosition="right"
                >
                  Enter Sanctuary
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-[hsl(var(--color-border))]"></div>
                <span className="px-3 text-xs text-[hsl(var(--color-text-muted))] uppercase font-bold tracking-widest">or</span>
                <div className="flex-grow border-t border-[hsl(var(--color-border))]"></div>
              </div>

              {/* Biometrics Login */}
              <div className="pt-2">
                {bioError && (
                  <div className="bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))] text-xs font-bold px-4 py-3 rounded-xl text-center mb-4">
                    {bioError}
                  </div>
                )}
                <button
                  type="button"
                  disabled={isBioSubmitting}
                  onClick={() => handleBiometricLogin(values.email)}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl text-[hsl(var(--color-text))] font-bold transition-colors hover:bg-[hsl(var(--color-bg-surface-hover))] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isBioSubmitting ? (
                    <LuLoader className="w-5 h-5 animate-spin text-[hsl(var(--color-primary))]" />
                  ) : (
                    <>
                      <LuFingerprint className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                      <span>Sign in with Biometrics</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[hsl(var(--color-text-muted))] mt-3 px-4 leading-relaxed font-medium">
                  Enter your email first, then click here to sign in instantly using Touch ID or Face ID.
                </p>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-10 pt-8 border-t border-[hsl(var(--color-border))] text-center space-y-4">
          <p className="text-sm text-[hsl(var(--color-text-muted))]">
            New to Carehub?{" "}
            <Link href="/register" className="font-bold hover:underline underline-offset-4 transition-all text-[hsl(var(--color-primary))]">
              Request Enrollment
            </Link>
          </p>

          <p className="text-sm text-[hsl(var(--color-text-muted))]">
            Received an OTP from admin?{" "}
            <Link
              href="/verify-otp?type=confirm"
              className="font-bold hover:underline underline-offset-4 transition-all text-[hsl(var(--color-primary))]"
            >
              Verify here
            </Link>
          </p>
        </div>
      </AuthCard>

      {/* Security Tag */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <LuShieldCheck className="w-4 h-4" style={{ color: "hsl(var(--color-text-muted))" }} />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: "hsl(var(--color-text-muted))" }}>
          HIPAA COMPLIANT ENVIRONMENT
        </span>
      </div>
    </div>
  );
};


