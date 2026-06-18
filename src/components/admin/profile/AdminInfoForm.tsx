"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ImSpinner2 } from "react-icons/im";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { LuUser, LuMail, LuPhone, LuMapPin, LuCheck } from "react-icons/lu";
import { useState } from "react";
import { toast } from "sonner";
import { AdminProfile, UpdateAdminProfilePayload, updateAdminProfile } from "@/services/adminService";

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = Yup.object({
  fullName:    Yup.string().min(3, "Min 3 characters").required("Full name is required"),
  phoneNumber: Yup.string().min(10, "Min 10 digits").optional(),
  address:     Yup.string().optional(),
});

type FormValues = {
  fullName:    string;
  phoneNumber: string;
  address:     string;
};

// ─── Reusable field ───────────────────────────────────────────────────────────
function EditField({ name, label, icon, placeholder, errors, touched }: {
  name: string; label: string; icon: React.ReactNode;
  placeholder: string;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
}) {
  const hasError = !!(errors[name] && touched[name]);
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
        <span className="w-4 h-4">{icon}</span>{label}
      </label>
      <Field
        id={name} name={name} placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] border ${
          hasError 
            ? "bg-red-50 border-red-400 text-red-900 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-200" 
            : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))]"
        }`}
      />
      <ErrorMessage name={name} component="p" className="text-red-500 text-xs pl-1 font-medium" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  profile: AdminProfile | null;
  onSaveSuccess: (updated: UpdateAdminProfilePayload) => void;
}

export default function AdminInfoForm({ profile, onSaveSuccess }: Props) {

  const initialValues: FormValues = {
    fullName:    profile?.fullName    ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    address:     profile?.address     ?? "",
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      const payload: UpdateAdminProfilePayload = {
        fullName:    values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        address:     values.address     || undefined,
      };
      await updateAdminProfile(payload);
      toast.success("Profile updated successfully!");
      onSaveSuccess(payload);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <h3 className="text-[14px] font-black text-[hsl(var(--color-text))]">Basic Information</h3>
        <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5">Update your personal details</p>
      </div>

      <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-6 pb-5 space-y-4">

              {/* Full Name */}
              <EditField name="fullName" label="Full Name" icon={<LuUser />} placeholder="Admin Name" errors={errors} touched={touched} />

              {/* Email — read only */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                  <LuMail className="w-4 h-4" /> Email
                </label>
                <div className="w-full px-4 py-3 rounded-xl text-[13px] text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] select-none">
                  {profile?.email || "—"}
                </div>
              </div>

              {/* Phone */}
              <EditField name="phoneNumber" label="Phone" icon={<LuPhone />} placeholder="0100 000 0000" errors={errors} touched={touched} />

              {/* Address */}
              <EditField name="address" label="Address" icon={<LuMapPin />} placeholder="123 Main St, Cairo" errors={errors} touched={touched} />
            </div>

            {/* Save button */}
            <div className="px-6 pb-6">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3.5 text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                style={{ background: "hsl(var(--color-primary))" }}
              >
                {isSubmitting
                  ? <><ImSpinner2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><HiOutlineArrowRight className="w-4 h-4" /> Save Changes</>
                }
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
