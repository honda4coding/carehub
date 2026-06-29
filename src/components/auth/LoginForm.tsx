"use client";
import { useState } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FieldProps } from "formik";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye,
  HiOutlineEyeOff, HiShieldCheck,
} from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import { FaFingerprint } from "react-icons/fa";
import { authenticateBiometrics } from "@/services/webAuthnService";
import {
  loginSchema,
  loginInitialValues,
  type LoginValues,
} from "../schemas/loginSchema";
import { useTranslations } from 'next-intl';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const LoginForm = () => {
  const t = useTranslations('auth.LoginForm');
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isBioSubmitting, setIsBioSubmitting] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  const handleBiometricLogin = async (email: string) => {
    if (!email) {
      setBioError(t('bioNoEmail'));
      return;
    }

    try {
      setIsBioSubmitting(true);
      setBioError(null);

      const res = await authenticateBiometrics(email);
      const data = res.data;
      const actualRole = data.role?.toLowerCase();

      if (!actualRole) {
        setBioError(t('unknownRole'));
        return;
      }

      login(data.access_token, actualRole, {
        id: data.id,
        email: email,
        name: data.fullName || data.name || email,
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
      const response = await fetch(`${BASE_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.message || t('invalidCredentials'));
        return;
      }

      const actualRole = data.data.role?.toLowerCase();

      if (!actualRole) {
        setStatus(t('unknownRole'));
        return;
      }

      login(data.data.access_token, actualRole, {
        id: data.data.id,
        email: values.email,
        name: data.data.fullName || data.data.name || values.email,
      });

    } catch (error) {
      setStatus(t('connectionError'));
      console.error("Login Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <AuthCard>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--color-text))" }}>
            {t('title')}
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "hsl(var(--color-text-muted))" }}
          >
            {t('subtitle')}
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
                <Label>{t('emailLabel')}</Label>
                <Field name="email">
                  {({ field, meta }: FieldProps) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      leftIcon={<HiOutlineMail className="w-5 h-5" />}
                      error={!!(meta.touched && meta.error)}
                    />
                  )}
                </Field>
                <ErrorMessage name="email" component="p" className="text-[hsl(var(--color-danger))] text-xs ps-2 font-bold mt-1" />
              </div>

              {/* Password */}
              <div>
                <Label>{t('passwordLabel')}</Label>
                <Field name="password">
                  {({ field, meta }: FieldProps) => (
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={t('passwordPlaceholder')}
                      leftIcon={<HiOutlineLockClosed className="w-5 h-5" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-[hsl(var(--color-text))] transition-colors">
                          {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      }
                      error={!!(meta.touched && meta.error)}
                    />
                  )}
                </Field>
                <ErrorMessage name="password" component="p" className="text-[hsl(var(--color-danger))] text-xs ps-2 font-bold mt-1" />
              </div>

              {/* Remember + Forgot */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-md border-slate-300 shrink-0"
                    style={{ accentColor: "hsl(var(--color-primary))" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "hsl(var(--color-text-muted))" }}
                  >
                    {t('staySignedIn')}
                  </span>
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href="/forgot-password" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--color-primary-strong))" }}>{t('forgotAccess')}</Link>
                  <Link href="/reset-password" className="text-xs font-bold transition-colors" style={{ color: "hsl(var(--color-primary-strong))" }}>{t('resetPassword')}</Link>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  isLoading={isSubmitting}
                  icon={HiOutlineArrowRight}
                  iconPosition="right"
                >
                  {t('submitButton')}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-[hsl(var(--color-border))]"></div>
                <span className="px-3 text-xs text-[hsl(var(--color-text-muted))] uppercase font-bold tracking-widest">{t('or')}</span>
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
                    <ImSpinner2 className="w-5 h-5 animate-spin text-[hsl(var(--color-primary))]" />
                  ) : (
                    <>
                      <FaFingerprint className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                      <span>{t('bioLoginButton')}</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[hsl(var(--color-text-muted))] mt-3 px-4 leading-relaxed font-medium">
                  {t('bioLoginDesc')}
                </p>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-10 pt-8 border-t border-[hsl(var(--color-border))] text-center space-y-4">
          <p className="text-sm text-[hsl(var(--color-text-muted))]">
            {t('newToCarehub')}{" "}
            <Link href="/register" className="font-bold hover:underline underline-offset-4 transition-all text-[hsl(var(--color-primary))]">
              {t('requestEnrollment')}
            </Link>
          </p>

          <p className="text-sm text-[hsl(var(--color-text-muted))]">
            {t('receivedOTP')}{" "}
            <Link
              href="/verify-otp?type=confirm"
              className="font-bold hover:underline underline-offset-4 transition-all text-[hsl(var(--color-primary))]"
            >
              {t('verifyHere')}
            </Link>
          </p>
        </div>
      </AuthCard>

      {/* Security Tag */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
        <HiShieldCheck className="w-4 h-4" style={{ color: "hsl(var(--color-text-muted))" }} />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: "hsl(var(--color-text-muted))" }}>
          {t('hipaa')}
        </span>
      </div>
    </div>
  );
};
