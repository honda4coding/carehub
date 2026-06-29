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
import { registerBiometrics } from "@/services/webAuthnService";
import { useTranslations } from "next-intl";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getUpdatePasswordSchema = (t: any) => Yup.object({
  oldpassword: Yup.string().required(t("oldPasswordReq")),
  newpassword: Yup.string()
    .min(8, t("newPasswordMin"))
    .required(t("newPasswordReq")),
  cpassword: Yup.string()
    .oneOf([Yup.ref("newpassword")], t("passwordsMatch"))
    .required(t("cPasswordReq")),
});

type UpdatePasswordValues = {
  oldpassword: string;
  newpassword: string;
  cpassword: string;
};

export default function UpdatePasswordForm() {
  const t = useTranslations("patient.PatientSecurityPage");
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
      setBioToast({ msg: t("faceIdSuccess"), variant: "success" });
    } catch (err: any) {
      setBioToast({ msg: err.message || t("failedEnableBio"), variant: "error" });
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
      setBioToast({ msg: t("bioRemoved"), variant: "success" });
    } catch (err: any) {
      setBioToast({ msg: err.message || t("failedRemoveBio"), variant: "error" });
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
        setToastMsg({ msg: data.message || t("somethingWrong"), variant: "error" });
        return;
      }

      setToastMsg({ msg: t("passwordUpdated"), variant: "success" });
      resetForm();
    } catch {
      setToastMsg({ msg: t("checkConnection"), variant: "error" });
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
        validationSchema={getUpdatePasswordSchema(t)}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-4">

            {/* Old Password */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold ps-4 tracking-wide uppercase text-[hsl(var(--color-text-muted))]">
                {t("currentPassword")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <Field name="oldpassword" type="password" placeholder="••••••••"
                  className="w-full ps-12 pe-4 py-3 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border bg-white"
                  style={{
                    backgroundColor: errors.oldpassword && touched.oldpassword ? "#fff5f5" : "white",
                    borderColor: errors.oldpassword && touched.oldpassword ? "#fc8181" : "hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="oldpassword" component="p" className="text-danger text-xs ps-4 font-medium" />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold ps-4 tracking-wide uppercase text-[hsl(var(--color-text-muted))]">
                {t("newPassword")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <Field name="newpassword" type="password" placeholder="••••••••"
                  className="w-full ps-12 pe-4 py-3 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border bg-white"
                  style={{
                    backgroundColor: errors.newpassword && touched.newpassword ? "#fff5f5" : "white",
                    borderColor: errors.newpassword && touched.newpassword ? "#fc8181" : "hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="newpassword" component="p" className="text-danger text-xs ps-4 font-medium" />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold ps-4 tracking-wide uppercase text-[hsl(var(--color-text-muted))]">
                {t("confirmNewPassword")}
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <Field name="cpassword" type="password" placeholder="••••••••"
                  className="w-full ps-12 pe-4 py-3 rounded-xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border bg-white"
                  style={{
                    backgroundColor: errors.cpassword && touched.cpassword ? "#fff5f5" : "white",
                    borderColor: errors.cpassword && touched.cpassword ? "#fc8181" : "hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }} />
              </div>
              <ErrorMessage name="cpassword" component="p" className="text-danger text-xs ps-4 font-medium" />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={isSubmitting}
                className="w-full md:w-auto py-3 px-6 bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white font-black text-[14px] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? (
                  <><ImSpinner2 className="w-5 h-5 animate-spin" /> {t("updating")}</>
                ) : (
                  <>{t("updatePassword")} <HiOutlineArrowRight className="w-5 h-5" /></>
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
            <div className={`p-1.5 rounded-lg ${isBioEnabled ? 'bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]'}`}>
              <FaFingerprint className="w-4 h-4" />
            </div>
            {t("biometricLogin")}
          </h3>
          <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-2 font-medium leading-relaxed">
            {t("biometricDesc")}
          </p>
        </div>

        {isBioEnabled ? (
          <div className="flex flex-col gap-3">
            <div className="w-full py-3 px-4 bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success)/0.2)] text-[hsl(var(--color-success))] font-bold text-[13px] rounded-xl flex items-center justify-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[hsl(var(--color-success))]"></span>
              </span>
              {t("bioEnabled")}
            </div>
            <button
              type="button"
              onClick={handleRemoveBiometrics}
              disabled={isRegisteringBio}
              className="w-full py-2.5 px-4 border border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger))] hover:text-white font-bold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRegisteringBio ? (
                <><ImSpinner2 className="w-4 h-4 animate-spin" /> {t("removing")}</>
              ) : (
                t("disableBiometrics")
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRegisterBiometrics}
            disabled={isRegisteringBio}
            className="w-full py-3 px-4 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface-hover))] font-bold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRegisteringBio ? (
              <><ImSpinner2 className="w-4 h-4 animate-spin" /> {t("settingUp")}</>
            ) : (
              t("enableBiometrics")
            )}
          </button>
        )}
      </div>
    </div>
  );
}