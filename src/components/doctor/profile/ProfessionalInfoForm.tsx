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
  LuChevronDown,
  LuMegaphone,
  LuGlobe,
  LuGraduationCap,
  LuCalendar,
  LuUsers,
  LuFacebook,
  LuInstagram,
  LuLinkedin,
} from "react-icons/lu";
import { useState } from "react";
import {
  DoctorProfile,
  UpdateDoctorProfilePayload,
  updateDoctorProfile,
} from "@/services/doctorService";

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

const schema = Yup.object({
  fullName: Yup.string()
    .min(3, "Min 3 characters")
    .required("Full name is required"),
  specialization: Yup.string().required("Specialization is required"),
  experience: Yup.number().min(0).max(60).required("Experience is required"),
  address: Yup.string().optional(),
  phoneNumber: Yup.string().min(10, "Min 10 digits").optional(),
  bio: Yup.string().min(20, "Min 20 characters").optional(),
  tagline: Yup.string().max(100, "Max 100 characters").optional(),
  languages: Yup.string().optional(),
  facebook: Yup.string().url("Must be a valid URL").optional(),
  instagram: Yup.string().url("Must be a valid URL").optional(),
  linkedin: Yup.string().url("Must be a valid URL").optional(),
  patientsTreated: Yup.number().min(0, "Cannot be negative").optional(),
  university: Yup.string().max(100, "Max 100 characters").optional(),
  graduationYear: Yup.number()
    .min(1960, "Must be after 1960")
    .max(new Date().getFullYear(), "Cannot be in the future")
    .optional(),
});

type FormValues = {
  fullName: string;
  phoneNumber: string;
  specialization: string;
  experience: number | "";
  address: string;
  bio: string;
  tagline: string;
  languages: string; // Comma separated for simplicity in the form
  facebook: string;
  instagram: string;
  linkedin: string;
  patientsTreated: number | "";
  university: string;
  graduationYear: number | "";
};

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
        {value || "—"}
      </div>
    </div>
  );
}

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
    tagline: profile?.tagline ?? "",
    languages: profile?.languages?.join(", ") ?? "",
    facebook: profile?.socialLinks?.facebook ?? "",
    instagram: profile?.socialLinks?.instagram ?? "",
    linkedin: profile?.socialLinks?.linkedin ?? "",
    patientsTreated: profile?.patientsTreated ?? "",
    university: profile?.university ?? "",
    graduationYear: profile?.graduationYear ?? "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      setServerError("");
      setServerSuccess("");
      
      const langs = values.languages
        ? values.languages.split(",").map((l) => l.trim()).filter(Boolean)
        : [];

      const payload: UpdateDoctorProfilePayload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        specialization: values.specialization,
        experience:
          values.experience === "" ? undefined : Number(values.experience),
        address: values.address || undefined,
        bio: values.bio || undefined,
        tagline: values.tagline || undefined,
        languages: langs.length > 0 ? langs : undefined,
        socialLinks: {
          facebook: values.facebook || undefined,
          instagram: values.instagram || undefined,
          linkedin: values.linkedin || undefined,
        },
        patientsTreated:
          values.patientsTreated === "" ? undefined : Number(values.patientsTreated),
        university: values.university || undefined,
        graduationYear:
          values.graduationYear === "" ? undefined : Number(values.graduationYear),
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
              ? "bg-[hsl(var(--color-danger-bg))] border-b border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))]"
              : "bg-[hsl(var(--color-success-bg))] border-b border-[hsl(var(--color-success)/0.2)] text-[hsl(var(--color-success))]"
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
            <div className="p-6 space-y-8">
              
              {/* SECTION: Basic Professional Info */}
              <div className="space-y-5">
                <h3 className="text-[15px] font-bold text-[hsl(var(--color-text))] border-b border-[hsl(var(--color-border))] pb-2">
                  Basic Information
                </h3>
                
                {/* Full Name */}
                <EditField
                  name="fullName"
                  label="Full Name"
                  icon={<LuUser />}
                  placeholder="Dr. Sarah Smith"
                  errors={errors}
                  touched={touched}
                />

                {/* Email — read only */}
                <ReadOnlyField
                  label="Email"
                  value={profile?.email ?? ""}
                  icon={<LuMail />}
                />
                
                {/* Phone — editable */}
                <EditField
                  name="phoneNumber"
                  label="Phone"
                  icon={<LuPhone />}
                  placeholder="01000000000"
                  errors={errors}
                  touched={touched}
                />

                {/* Specialization + Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">
                        <LuChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                    <ErrorMessage
                      name="specialization"
                      component="p"
                      className="text-[hsl(var(--color-danger))] text-xs pl-1 font-medium"
                    />
                  </div>

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
                    className="text-[hsl(var(--color-danger))] text-xs pl-1 font-medium"
                  />
                </div>
              </div>

              {/* SECTION: Marketing & Academic */}
              <div className="space-y-5">
                <h3 className="text-[15px] font-bold text-[hsl(var(--color-text))] border-b border-[hsl(var(--color-border))] pb-2">
                  Marketing & Academic Profile
                </h3>
                
                {/* Tagline */}
                <EditField
                  name="tagline"
                  label="Marketing Tagline"
                  icon={<LuMegaphone />}
                  placeholder="E.g. Trusted by families across the city for 15 years"
                  errors={errors}
                  touched={touched}
                />

                {/* Languages + Patients Treated */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField
                    name="languages"
                    label="Languages (comma separated)"
                    icon={<LuGlobe />}
                    placeholder="E.g. Arabic, English"
                    errors={errors}
                    touched={touched}
                  />
                  <EditField
                    name="patientsTreated"
                    label="Patients Treated (Approximate)"
                    icon={<LuUsers />}
                    placeholder="E.g. 1500"
                    type="number"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                {/* University + Graduation Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField
                    name="university"
                    label="University"
                    icon={<LuGraduationCap />}
                    placeholder="E.g. Cairo University"
                    errors={errors}
                    touched={touched}
                  />
                  <EditField
                    name="graduationYear"
                    label="Graduation Year"
                    icon={<LuCalendar />}
                    placeholder="E.g. 2010"
                    type="number"
                    errors={errors}
                    touched={touched}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4 pt-2">
                  <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">Social Links</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditField
                      name="facebook"
                      label="Facebook URL"
                      icon={<LuFacebook />}
                      placeholder="https://facebook.com/..."
                      errors={errors}
                      touched={touched}
                    />
                    <EditField
                      name="instagram"
                      label="Instagram URL"
                      icon={<LuInstagram />}
                      placeholder="https://instagram.com/..."
                      errors={errors}
                      touched={touched}
                    />
                    <EditField
                      name="linkedin"
                      label="LinkedIn URL"
                      icon={<LuLinkedin />}
                      placeholder="https://linkedin.com/in/..."
                      errors={errors}
                      touched={touched}
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Save button */}
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
