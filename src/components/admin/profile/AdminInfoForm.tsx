"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { LuLoader } from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
import { LuUser, LuMail, LuPhone, LuMapPin, LuCheck } from "react-icons/lu";
import { useState } from "react";
import { AdminProfile, UpdateAdminProfilePayload, updateAdminProfile } from "@/services/adminService";

// â”€â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Reusable field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)]"
        style={{
          backgroundColor: hasError ? "#fff5f5" : "white",
          border: hasError ? "1.5px solid #fc8181" : "1px solid hsl(var(--color-border))",
          color: "hsl(var(--color-text))",
        }}
      />
      <ErrorMessage name={name} component="p" className="text-danger text-xs pl-1 font-medium" />
    </div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Props {
  profile: AdminProfile | null;
  onSaveSuccess: (updated: UpdateAdminProfilePayload) => void;
}

export default function AdminInfoForm({ profile, onSaveSuccess }: Props) {
  const [serverError,   setServerError]   = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const initialValues: FormValues = {
    fullName:    profile?.fullName    ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    address:     profile?.address     ?? "",
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      setServerError("");
      setServerSuccess("");
      const payload: UpdateAdminProfilePayload = {
        fullName:    values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        address:     values.address     || undefined,
      };
      await updateAdminProfile(payload);
      setServerSuccess("Profile updated successfully!");
      onSaveSuccess(payload);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <h3 className="text-[14px] font-black text-[hsl(var(--color-text))]">Basic Information</h3>
        <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5">Update your personal details</p>
      </div>

      {(serverError || serverSuccess) && (
        <div className={`mx-6 mb-3 px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-2 ${
          serverError
            ? "bg-danger-light border border-red-200 text-danger"
            : "bg-success-light border border-green-200 text-success"
        }`}>
          {serverSuccess && <LuCheck className="w-4 h-4 shrink-0" />}
          {serverError || serverSuccess}
        </div>
      )}

      <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="px-6 pb-5 space-y-4">

              {/* Full Name */}
              <EditField name="fullName" label="Full Name" icon={<LuUser />} placeholder="Admin Name" errors={errors} touched={touched} />

              {/* Email â€” read only */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                  <LuMail className="w-4 h-4" /> Email
                </label>
                <div className="w-full px-4 py-3 rounded-xl text-[13px] text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] select-none">
                  {profile?.email || "â€”"}
                </div>
              </div>

              {/* Phone */}
              <EditField name="phoneNumber" label="Phone" icon={<LuPhone />} placeholder="0100 000 0000" errors={errors} touched={touched} />

              {/* Address */}
              <EditField name="address" label="Address" icon={<LuMapPin />} placeholder="123 Main St, Cairo" errors={errors} touched={touched} />
            </div>

            {/* Save button */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
              <button
                type="submit" disabled={isSubmitting}
                className="py-3 px-6 text-white text-[14px] font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))]"
              >
                {isSubmitting
                  ? <><LuLoader className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><LuArrowRight className="w-4 h-4" /> Save Changes</>
                }
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}


