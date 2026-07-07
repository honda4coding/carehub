"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { LuLoader } from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
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

// Ù†ÙØ³ Ø§Ù„Ù€ list Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯Ø© ÙÙŠ ØµÙØ­Ø© Ø§Ù„Ù€ signup
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

// â”€â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Reusable read-only field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
        <span className="w-4 h-4">{icon}</span>
        {label}
      </label>
      <div className="w-full px-4 py-3 rounded-xl text-[13px] text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] select-none">
        {value || "â€”"}
      </div>
    </div>
  );
}

// â”€â”€â”€ Reusable editable field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        className={`w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] text-[hsl(var(--color-text))] ${
          hasError
            ? "bg-[hsl(var(--color-danger-bg))] border-[1.5px] border-[hsl(var(--color-danger))]"
            : "bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))]"
        }`}
      />
      <ErrorMessage
        name={name}
        component="p"
        className="text-danger text-xs pl-1 font-medium"
      />
    </div>
  );
}

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Props {
  profile: DoctorProfile | null;
  onSaveSuccess: (updated: UpdateDoctorProfilePayload) => void;
}

export default function ProfessionalInfoForm({
  profile,
  onSaveSuccess,
}: Props) {
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
                label="Full Name"
                icon={<LuUser />}
                placeholder="Dr. Sarah Smith"
                errors={errors}
                touched={touched}
              />

              {/* Email â€” read only */}
              <ReadOnlyField
                label="Email"
                value={profile?.email ?? ""}
                icon={<LuMail />}
              />
              {/* Phone â€” editable */}
              <EditField
                name="phoneNumber"
                label="Phone"
                icon={<LuPhone />}
                placeholder="01000000000"
                errors={errors}
                touched={touched}
              />

              {/* Specialization dropdown + Experience â€” 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Specialization â€” dropdown */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="specialization"
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-[hsl(var(--color-text-muted))]"
                  >
                    <LuStethoscope className="w-4 h-4" />
                    Specialization
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      id="specialization"
                      name="specialization"
                      className={`w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all appearance-none cursor-pointer text-[hsl(var(--color-text))] ${
                        errors.specialization && touched.specialization
                          ? "bg-[hsl(var(--color-danger-bg))] border-[1.5px] border-[hsl(var(--color-danger))]"
                          : "bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))]"
                      }`}
                    >
                      <option value="">Select specialization</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Field>
                    {/* Dropdown arrow */}
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">
                      â–¾
                    </span>
                  </div>
                  <ErrorMessage
                    name="specialization"
                    component="p"
                    className="text-danger text-xs pl-1 font-medium"
                  />
                </div>

                {/* Experience */}
                <EditField
                  name="experience"
                  label="Experience (Years)"
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
                  Bio
                </label>
                <Field
                  as="textarea"
                  id="bio"
                  name="bio"
                  rows={4}
                  placeholder="Board-certified internist with 15 years of experience in primary care and chronic disease management."
                  className={`w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all resize-none placeholder:text-[hsl(var(--color-text-muted)/0.4)] text-[hsl(var(--color-text))] ${
                    errors.bio && touched.bio
                      ? "bg-[hsl(var(--color-danger-bg))] border-[1.5px] border-[hsl(var(--color-danger))]"
                      : "bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))]"
                  }`}
                />
                <ErrorMessage
                  name="bio"
                  component="p"
                  className="text-danger text-xs pl-1 font-medium"
                />
              </div>
            </div>

            {/* Save button â€” full width, attached to bottom */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 text-white text-[14px] font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))]"
              >
                {isSubmitting ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <LuArrowRight className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}


