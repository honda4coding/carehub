"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ImSpinner2 } from "react-icons/im";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { LuUser, LuPhone, LuCalendar, LuMapPin, LuMail, LuCheck, LuShield } from "react-icons/lu";
import { useState } from "react";
import { PatientProfile, UpdatePatientProfilePayload, updatePatientProfile } from "@/services/patientService";

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = Yup.object({
  fullName:       Yup.string().min(3, "Min 3 characters").required("Full name is required"),
  phoneNumber:    Yup.string().min(10, "Min 10 digits").optional(),
  age:            Yup.number().min(1).max(120).optional(),
  gender:         Yup.string().oneOf(["male", "female"]).optional(),
  address:        Yup.string().optional(),
  sharingSetting: Yup.string().oneOf(["all", "own_only", "otp"]).optional(),
});

type FormValues = {
  fullName:       string;
  phoneNumber:    string;
  age:            number | "";
  gender:         "male" | "female" | "";
  address:        string;
  sharingSetting: "all" | "own_only" | "otp" | "";
};

// ─── Reusable field ───────────────────────────────────────────────────────────
function EditField({ name, label, icon, placeholder, type = "text", errors, touched }: {
  name: string; label: string; icon: React.ReactNode;
  placeholder: string; type?: string;
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
        id={name} name={name} type={type} placeholder={placeholder}
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

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  profile: PatientProfile | null;
  onSaveSuccess: (updated: UpdatePatientProfilePayload) => void;
}

export default function BasicInfoForm({ profile, onSaveSuccess }: Props) {
  const [serverError,   setServerError]   = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const initialValues: FormValues = {
    fullName:       profile?.fullName       ?? "",
    phoneNumber:    profile?.phoneNumber    ?? "",
    age:            profile?.age            ?? "",
    gender:         profile?.gender         ?? "",
    address:        profile?.address        ?? "",
    sharingSetting: profile?.sharingSetting ?? "",
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    try {
      setServerError("");
      setServerSuccess("");
      const payload: UpdatePatientProfilePayload = {
        fullName:       values.fullName,
        phoneNumber:    values.phoneNumber    || undefined,
        age:            values.age === "" ? undefined : Number(values.age),
        gender:         values.gender         || undefined,
        address:        values.address        || undefined,
        sharingSetting: (values.sharingSetting || undefined) as "all" | "own_only" | "otp" | undefined,
      };
      await updatePatientProfile(payload);
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
        {({ errors, touched, isSubmitting, values, setFieldValue }) => (
          <Form>
            <div className="px-6 pb-5 space-y-4">

              {/* Full Name */}
              <EditField name="fullName" label="Full Name" icon={<LuUser />} placeholder="John Doe" errors={errors} touched={touched} />

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

              {/* Age + Gender — 2 cols */}
              <div className="grid grid-cols-2 gap-4">
                <EditField name="age" label="Age" icon={<LuCalendar />} placeholder="25" type="number" errors={errors} touched={touched} />

                {/* Gender dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="gender" className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                    <span className="w-4 h-4 text-base">⚧</span> Gender
                  </label>
                  <div className="relative">
                    <Field
                      as="select" id="gender" name="gender"
                      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all appearance-none cursor-pointer"
                      style={{
                        backgroundColor: errors.gender && touched.gender ? "#fff5f5" : "white",
                        border: errors.gender && touched.gender ? "1.5px solid #fc8181" : "1px solid hsl(var(--color-border))",
                        color: "hsl(var(--color-text))",
                      }}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Field>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">▾</span>
                  </div>
                  <ErrorMessage name="gender" component="p" className="text-danger text-xs pl-1 font-medium" />
                </div>
              </div>

              {/* Address */}
              <EditField name="address" label="Address" icon={<LuMapPin />} placeholder="123 Main St, Cairo" errors={errors} touched={touched} />

              {/* Privacy Setting */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                  <span className="w-4 h-4"><LuShield /></span> Medical Record Privacy
                </label>
                
                <div className="flex bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl p-1.5 gap-1">
                  {[
                    { val: "all", label: "Public" },
                    { val: "own_only", label: "Restricted" },
                    { val: "otp", label: "Protected (OTP)" },
                  ].map((opt) => {
                    const isActive = values.sharingSetting === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setFieldValue("sharingSetting", opt.val)}
                        className={`flex-1 py-2 text-[12.5px] font-bold rounded-lg transition-all cursor-pointer ${
                          isActive 
                            ? "bg-white shadow-sm border border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))]" 
                            : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-black/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {errors.sharingSetting && touched.sharingSetting && (
                  <p className="text-danger text-xs pl-1 font-medium">{errors.sharingSetting}</p>
                )}
                <p className="text-[11px] text-[hsl(var(--color-text-muted))] pl-1">
                  Controls how doctors access your medical records.
                </p>
              </div>
            </div>

            {/* Save button */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
              <button
                type="submit" disabled={isSubmitting}
                className="py-3 px-6 text-white text-[14px] font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))]"
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
