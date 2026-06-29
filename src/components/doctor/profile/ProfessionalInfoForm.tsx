"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ImSpinner2 } from "react-icons/im";
import { HiOutlineArrowRight } from "react-icons/hi2";
import {
  LuUser,
  LuMail,
  LuPhone,
  LuBuilding2,
  LuBriefcase,
  LuFileText,
  LuCheck,
  LuStethoscope,
} from "react-icons/lu";
import { useState } from "react";
import {
  DoctorProfile,
  UpdateDoctorProfilePayload,
  updateDoctorProfile,
} from "@/services/doctorService";
import { useTranslations } from "next-intl";

// نفس الـ list الموجودة في صفحة الـ signup
const SPECIALTIES = [
  { value: "general_practice", label: "General Practice" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "internal_medicine", label: "Internal Medicine" },
  { value: "neurology", label: "Neurology" },
  { value: "psychiatry", label: "Psychiatry" },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = Yup.object({
  fullName: Yup.string()
    .min(3, "Min 3 characters")
    .required("Full name is required"),
  specialization: Yup.string().required("Specialization is required"),
  experience: Yup.number().min(0).max(60).required("Experience is required"),
  address: Yup.string().optional(),
  phoneNumber: Yup.string().min(10, "Min 10 digits").optional(),
  bio: Yup.string().min(20, "Min 20 characters").optional(),
});

type FormValues = {
  fullName: string;
  phoneNumber: string;
  specialization: string;
  experience: number | "";
  address: string;
  bio: string;
};

// ─── Reusable read-only field ─────────────────────────────────────────────────
function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
    const t = useTranslations("auto");
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
        <span className="w-4 h-4">{icon}</span>
        {label}
      </label>
      <div className="w-full px-4 py-3 rounded-xl text-[13px] text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] select-none">
        {value || "—"}
      </div>
    </div>
  );
}

// ─── Reusable editable field ──────────────────────────────────────────────────
function EditField({
  name,
  label,
  icon,
  placeholder,
  type = "text",
  errors,
  touched,
}: {
  name: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
}) {
    const t = useTranslations("auto");
  const hasError = !!(errors[name] && touched[name]);
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]"
      >
        <span className="w-4 h-4">{icon}</span>
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)]"
        style={{
          backgroundColor: hasError ? "#fff5f5" : "white",
          border: hasError
            ? "1.5px solid #fc8181"
            : "1px solid hsl(var(--color-border))",
          color: "hsl(var(--color-text))",
        }}
      />
      <ErrorMessage
        name={name}
        component="p"
        className="text-danger text-xs ps-1 font-medium"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  profile: DoctorProfile | null;
  onSaveSuccess: (updated: UpdateDoctorProfilePayload) => void;
}

export default function ProfessionalInfoForm({
  profile,
  onSaveSuccess,
}: Props) {
    const t = useTranslations("auto");
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const initialValues: FormValues = {
    fullName: profile?.fullName ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
    specialization: profile?.specialization ?? "",
    experience: profile?.experience ?? "",
    address: profile?.address ?? "",
    bio: profile?.bio ?? "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      setServerError("");
      setServerSuccess("");
      const payload: UpdateDoctorProfilePayload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        specialization: values.specialization,
        experience:
          values.experience === "" ? undefined : Number(values.experience),
        address: values.address || undefined,
        bio: values.bio || undefined,
      };
      await updateDoctorProfile(payload);
      setServerSuccess("Profile updated successfully!");
      onSaveSuccess(payload);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Server messages */}
      {(serverError || serverSuccess) && (
        <div
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
            serverError
              ? "bg-danger-light border-b border-red-200 text-danger"
              : "bg-success-light border-b border-green-200 text-success"
          }`}
        >
          {serverSuccess && <LuCheck className="w-4 h-4 shrink-0" />}
          {serverError || serverSuccess}
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="p-6 space-y-5">
              {/* Full Name */}
              <EditField
                name="fullName"
                label={t('fullName')}
                icon={<LuUser />}
                placeholder={t('drSarahSmith')}
                errors={errors}
                touched={touched}
              />

              {/* Email — read only */}
              <ReadOnlyField
                label={t('email')}
                value={profile?.email ?? ""}
                icon={<LuMail />}
              />
              {/* Phone — editable */}
              <EditField
                name="phoneNumber"
                label={t('phone_xeaa')}
                icon={<LuPhone />}
                placeholder="01000000000"
                errors={errors}
                touched={touched}
              />

              {/* Specialization dropdown + Experience — 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Specialization — dropdown */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="specialization"
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]"
                  >
                    <LuStethoscope className="w-4 h-4" />
                    {t('specialization')}</label>
                  <div className="relative">
                    <Field
                      as="select"
                      id="specialization"
                      name="specialization"
                      className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all appearance-none cursor-pointer"
                      style={{
                        backgroundColor:
                          errors.specialization && touched.specialization
                            ? "#fff5f5"
                            : "white",
                        border:
                          errors.specialization && touched.specialization
                            ? "1.5px solid #fc8181"
                            : "1px solid hsl(var(--color-border))",
                        color: "hsl(var(--color-text))",
                      }}
                    >
                      <option value="">{t('selectSpecialization')}</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Field>
                    {/* Dropdown arrow */}
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">
                      ▾
                    </span>
                  </div>
                  <ErrorMessage
                    name="specialization"
                    component="p"
                    className="text-danger text-xs ps-1 font-medium"
                  />
                </div>

                {/* Experience */}
                <EditField
                  name="experience"
                  label={t('experienceYears')}
                  icon={<LuBriefcase />}
                  placeholder="5"
                  type="number"
                  errors={errors}
                  touched={touched}
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label
                  htmlFor="bio"
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]"
                >
                  <LuFileText className="w-4 h-4" />
                  {t('bio')}</label>
                <Field
                  as="textarea"
                  id="bio"
                  name="bio"
                  rows={4}
                  placeholder={t('boardcertifiedInternistWith15')}
                  className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all resize-none placeholder:text-[hsl(var(--color-text-muted)/0.4)]"
                  style={{
                    backgroundColor:
                      errors.bio && touched.bio ? "#fff5f5" : "white",
                    border:
                      errors.bio && touched.bio
                        ? "1.5px solid #fc8181"
                        : "1px solid hsl(var(--color-border))",
                    color: "hsl(var(--color-text))",
                  }}
                />
                <ErrorMessage
                  name="bio"
                  component="p"
                  className="text-danger text-xs ps-1 font-medium"
                />
              </div>
            </div>

            {/* Save button — full width, attached to bottom */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 text-white text-[14px] font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))]"
              >
                {isSubmitting ? (
                  <>
                    <ImSpinner2 className="w-4 h-4 animate-spin" /> {t('saving')}</>
                ) : (
                  <>
                    <HiOutlineArrowRight className="w-4 h-4" /> {t('saveChanges')}</>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
