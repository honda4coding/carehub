"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { LuLock, LuKeyRound, LuShieldCheck, LuArrowRight, LuLoader, LuFingerprint } from "react-icons/lu";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import { registerBiometrics } from "@/services/webAuthnService";
import { fetchClient } from "@/services/fetchClient";

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
  const [bioToast, setBioToast] = React.useState<{ msg: string; variant?: "success" | "error" } | null>(null);
  const [isBioEnabled, setIsBioEnabled] = React.useState(false);

  React.useEffect(() => {
    import("@/services/webAuthnService").then((module) => {
      module.getBiometricStatus().then((status) => {
        setIsBioEnabled(status.enabled);
      });
    });
  }, []);

  const handleRegisterBiometrics = async () => {
    try {
      setIsRegisteringBio(true);
      setBioToast(null);
      await registerBiometrics();
      setIsBioEnabled(true);
      setBioToast({ msg: "FaceID / TouchID registered successfully!", variant: "success" });
    } catch (err: any) {
      setBioToast({ msg: err.message || "Failed to enable biometric login.", variant: "error" });
    } finally {
      setIsRegisteringBio(false);
    }
  };

  const handleRemoveBiometrics = async () => {
    try {
      setIsRegisteringBio(true);
      setBioToast(null);
      const { removeBiometrics } = await import("@/services/webAuthnService");
      await removeBiometrics();
      setIsBioEnabled(false);
      setBioToast({ msg: "Biometric login removed successfully.", variant: "success" });
    } catch (err: any) {
      setBioToast({ msg: err.message || "Failed to remove biometrics.", variant: "error" });
    } finally {
      setIsRegisteringBio(false);
    }
  };

  const handleSubmit = async (
    values: UpdatePasswordValues,
    { setSubmitting, resetForm }: FormikHelpers<UpdatePasswordValues>
  ) => {
    try {
      setToastMsg(null);

      await fetchClient.patch("/users/update-password", {
        oldpassword: values.oldpassword,
        newpassword: values.newpassword,
        cpassword: values.cpassword,
      });

      setToastMsg({ msg: "Password updated successfully!", variant: "success" });
      resetForm();
    } catch (err: any) {
      setToastMsg({ msg: err.message || "Something went wrong. Please check your connection.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
      {toastMsg && <AppointmentToast message={toastMsg.msg} variant={toastMsg.variant} onClose={() => setToastMsg(null)} />}
      {bioToast && <AppointmentToast message={bioToast.msg} variant={bioToast.variant} onClose={() => setBioToast(null)} />}

      {/* ── Column 1: Password Update ── */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-[24px] p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--color-primary)/0.05)] rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--color-primary-soft))] flex items-center justify-center text-[hsl(var(--color-primary))]">
            <LuKeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-[hsl(var(--color-text))]">Change Password</h2>
            <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">Ensure your account stays secure</p>
          </div>
        </div>

        <Formik
          initialValues={{ oldpassword: "", newpassword: "", cpassword: "" }}
          validationSchema={updatePasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Old Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold pl-2 tracking-wider uppercase text-[hsl(var(--color-text-muted))]">
                    Current Password
                  </label>
                  <div className="relative group">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[hsl(var(--color-text-muted))] group-focus-within:text-[hsl(var(--color-primary))] transition-colors" />
                    <Field name="oldpassword" type="password" placeholder="••••••••"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] text-[14px] font-medium text-[hsl(var(--color-text))] ${
                        errors.oldpassword && touched.oldpassword
                          ? "bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger))] ring-4 ring-[hsl(var(--color-danger)/0.1)]"
                          : "bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]"
                      }`} />
                  </div>
                  <ErrorMessage name="oldpassword" component="p" className="text-[hsl(var(--color-danger))] text-[11px] pl-2 font-medium" />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold pl-2 tracking-wider uppercase text-[hsl(var(--color-text-muted))]">
                    New Password
                  </label>
                  <div className="relative group">
                    <LuShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[hsl(var(--color-text-muted))] group-focus-within:text-[hsl(var(--color-primary))] transition-colors" />
                    <Field name="newpassword" type="password" placeholder="••••••••"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] text-[14px] font-medium text-[hsl(var(--color-text))] ${
                        errors.newpassword && touched.newpassword
                          ? "bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger))] ring-4 ring-[hsl(var(--color-danger)/0.1)]"
                          : "bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]"
                      }`} />
                  </div>
                  <ErrorMessage name="newpassword" component="p" className="text-[hsl(var(--color-danger))] text-[11px] pl-2 font-medium" />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold pl-2 tracking-wider uppercase text-[hsl(var(--color-text-muted))]">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[hsl(var(--color-text-muted))] group-focus-within:text-[hsl(var(--color-primary))] transition-colors" />
                    <Field name="cpassword" type="password" placeholder="••••••••"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] text-[14px] font-medium text-[hsl(var(--color-text))] ${
                        errors.cpassword && touched.cpassword
                          ? "bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger))] ring-4 ring-[hsl(var(--color-danger)/0.1)]"
                          : "bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]"
                      }`} />
                  </div>
                  <ErrorMessage name="cpassword" component="p" className="text-[hsl(var(--color-danger))] text-[11px] pl-2 font-medium" />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-8">
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-4 bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] shadow-md hover:shadow-lg hover:-translate-y-0.5 text-white font-black text-[14px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                  {isSubmitting ? (
                    <><LuLoader className="w-5 h-5 animate-spin" /> Updating...</>
                  ) : (
                    <>Update Password <LuArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* ── Column 2: Biometrics & Security ── */}
      <div className="flex flex-col gap-6">
        {/* Biometrics Card */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-[24px] p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none transition-colors duration-500 ${isBioEnabled ? 'bg-[hsl(var(--color-success)/0.05)]' : 'bg-[hsl(var(--color-text-muted)/0.03)]'}`} />
          
          <div className="flex items-center gap-4 mb-6 relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isBioEnabled ? 'bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]'}`}>
              <LuFingerprint className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[hsl(var(--color-text))]">Biometric Login</h2>
              <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">FaceID or TouchID</p>
            </div>
          </div>

          <p className="text-[13px] text-[hsl(var(--color-text-muted))] font-medium leading-relaxed mb-8">
            Enable biometric authentication to log in securely and instantly without entering your password every time.
          </p>

          {isBioEnabled ? (
            <div className="flex flex-col gap-3">
              <div className="w-full py-4 px-4 bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success)/0.2)] text-[hsl(var(--color-success))] font-bold text-[13px] rounded-xl flex items-center justify-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--color-success))] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--color-success))]"></span>
                </span>
                Biometrics is Active
              </div>
              <button
                type="button"
                onClick={handleRemoveBiometrics}
                disabled={isRegisteringBio}
                className="w-full py-3.5 px-4 bg-transparent border-[1.5px] border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-bg))] hover:border-[hsl(var(--color-danger)/0.5)] font-bold text-[13px] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRegisteringBio ? (
                  <><LuLoader className="w-5 h-5 animate-spin" /> Removing...</>
                ) : (
                  "Disable Biometrics"
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRegisterBiometrics}
              disabled={isRegisteringBio}
              className="w-full py-3.5 px-4 bg-[hsl(var(--color-bg))] border-[1.5px] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))] text-[hsl(var(--color-text))] font-black text-[13px] rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isRegisteringBio ? (
                <><LuLoader className="w-5 h-5 animate-spin" /> Setting up...</>
              ) : (
                <>
                  <LuFingerprint className="w-5 h-5 text-[hsl(var(--color-text-muted))] group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                  Enable Biometric Login
                </>
              )}
            </button>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-[hsl(var(--color-primary)/0.03)] border border-[hsl(var(--color-primary)/0.1)] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-[13px] font-black text-[hsl(var(--color-primary))] mb-4 uppercase tracking-wider">Security Tips</h3>
          <ul className="space-y-3">
            {[
              "Use a password that is at least 8 characters long.",
              "Include numbers and special characters.",
              "Never share your password with anyone.",
              "Use Biometric login for faster and safer access."
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-[13px] text-[hsl(var(--color-text-muted))] font-medium leading-relaxed">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary)/0.5)] mt-2" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

