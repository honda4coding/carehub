"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { HiOutlineLockClosed } from "react-icons/hi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import { FaFingerprint } from "react-icons/fa";
import { registerBiometrics, checkBiometricsStatus, disableBiometrics } from "@/services/webAuthnService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const updatePasswordSchema = Yup.object({
  oldpassword: Yup.string().required("Old password is required"),
  newpassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  cpassword: Yup.string()
    .oneOf([Yup.ref("newpassword")], "Passwords must match")
    .required("Confirm password is required"),
});

type UpdatePasswordValues = {
  oldpassword: string;
  newpassword: string;
  cpassword: string;
};

export default function UpdatePasswordForm() {
  const { token } = useAuth();
  const [toastMsg, setToastMsg] = React.useState<{ msg: string; variant?: "success" | "error" } | null>(null);
  const [isRegisteringBio, setIsRegisteringBio] = React.useState(false);
  const [isDisablingBio, setIsDisablingBio] = React.useState(false);
  const [isCheckingBio, setIsCheckingBio] = React.useState(true);
  const [hasBiometrics, setHasBiometrics] = React.useState(false);
  const [bioToast, setBioToast] = React.useState<{ msg: string; variant?: "success" | "error" } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const active = await checkBiometricsStatus();
      if (isMounted) {
        setHasBiometrics(active);
        setIsCheckingBio(false);
      }
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegisterBiometrics = async () => {
    try {
      setIsRegisteringBio(true);
      setBioToast(null);
      await registerBiometrics();
      setHasBiometrics(true);
      setBioToast({ msg: "FaceID / TouchID registered successfully!", variant: "success" });
    } catch (err: any) {
      setBioToast({ msg: err.message || "Failed to enable biometric login.", variant: "error" });
    } finally {
      setIsRegisteringBio(false);
    }
  };

  const handleDisableBiometrics = async () => {
    try {
      setIsDisablingBio(true);
      setBioToast(null);
      await disableBiometrics();
      setHasBiometrics(false);
      setBioToast({ msg: "Biometric login disabled successfully.", variant: "success" });
    } catch (err: any) {
      setBioToast({ msg: err.message || "Failed to disable biometric login.", variant: "error" });
    } finally {
      setIsDisablingBio(false);
    }
  };

  const handleSubmit = async (
    values: UpdatePasswordValues,
    { setSubmitting, resetForm }: FormikHelpers<UpdatePasswordValues>
  ) => {
    try {
      setToastMsg(null);

      const res = await fetch(`${BASE_URL}/users/update-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldpassword: values.oldpassword,
          newpassword: values.newpassword,
          cpassword: values.cpassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMsg({ msg: data.message || "Something went wrong.", variant: "error" });
        return;
      }

      setToastMsg({ msg: "Password updated successfully!", variant: "success" });
      resetForm();
    } catch {
      setToastMsg({ msg: "Something went wrong. Please check your connection.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 md:p-10 w-full max-w-[600px] shadow-sm">
      {toastMsg && <AppointmentToast message={toastMsg.msg} variant={toastMsg.variant} onClose={() => setToastMsg(null)} />}
      {bioToast && <AppointmentToast message={bioToast.msg} variant={bioToast.variant} onClose={() => setBioToast(null)} />}
      
      {/* Header */}

      <Formik
        initialValues={{ oldpassword: "", newpassword: "", cpassword: "" }}
        validationSchema={updatePasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-4">

            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold pl-4 tracking-wide uppercase text-[hsl(var(--color-text-muted))]">
                Current Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <Field name="oldpassword" type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border bg-white"
                  style={{
                    backgroundColor: errors.oldpassword && touched.oldpassword ? "#fff5f5" : "white",
                    borderColor: errors.oldpassword && touched.oldpassword ? "#fc8181" : "hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="oldpassword" component="p" className="text-danger text-xs pl-4 font-medium" />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold pl-4 tracking-wide uppercase text-[hsl(var(--color-text-muted))]">
                New Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <Field name="newpassword" type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border bg-white"
                  style={{
                    backgroundColor: errors.newpassword && touched.newpassword ? "#fff5f5" : "white",
                    borderColor: errors.newpassword && touched.newpassword ? "#fc8181" : "hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="newpassword" component="p" className="text-danger text-xs pl-4 font-medium" />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold pl-4 tracking-wide uppercase text-[hsl(var(--color-text-muted))]">
                Confirm New Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <Field name="cpassword" type="password" placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border bg-white"
                  style={{
                    backgroundColor: errors.cpassword && touched.cpassword ? "#fff5f5" : "white",
                    borderColor: errors.cpassword && touched.cpassword ? "#fc8181" : "hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="cpassword" component="p" className="text-danger text-xs pl-4 font-medium" />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={isSubmitting}
                className="py-3 px-6 bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white font-black text-[14px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? (
                  <><ImSpinner2 className="w-5 h-5 animate-spin" /> Updating...</>
                ) : (
                  <>Update Password <HiOutlineArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>

          </Form>
        )}
      </Formik>

      {/* Divider */}
      <hr className="my-6 border-[hsl(var(--color-border))]" />

      {/* Biometrics Setup */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <FaFingerprint className="w-5 h-5 text-[hsl(var(--color-primary))]" /> Biometric Login
          </h3>
          <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-1 font-semibold">
            Use your device's fingerprint scanner or facial recognition (FaceID/TouchID) to log in instantly next time.
          </p>
        </div>
        
        {isCheckingBio ? (
          <div className="text-xs text-[hsl(var(--color-text-muted))] font-semibold animate-pulse">
            Checking status...
          </div>
        ) : hasBiometrics ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Biometric Login is currently: <span className="underline">Enabled</span>
            </div>
            <button
              type="button"
              onClick={handleDisableBiometrics}
              disabled={isDisablingBio}
              className="w-full py-3 px-4 border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-black text-[13px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDisablingBio ? (
                <><ImSpinner2 className="w-4 h-4 animate-spin" /> Disabling...</>
              ) : (
                <>Disable Biometric Login</>
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRegisterBiometrics}
            disabled={isRegisteringBio}
            className="w-full py-3 px-4 border border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-primary)/0.05)] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-white font-black text-[13px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRegisteringBio ? (
              <><ImSpinner2 className="w-4 h-4 animate-spin" /> Setting up...</>
            ) : (
              <>Enable Biometric Login</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}