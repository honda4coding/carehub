"use client";

import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ImSpinner2 } from "react-icons/im";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { LuCheck } from "react-icons/lu";
import { useState } from "react";
import { PatientProfile, UpdatePatientProfilePayload, updatePatientProfile } from "@/services/patientService";
import { VitalsFormValues } from "@/types/profile";

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = Yup.object({
  weight: Yup.string().optional(),
  height: Yup.string().optional(),
  pulse:  Yup.string().optional(),
});

// ─── Vital Card ───────────────────────────────────────────────────────────────
function VitalCard({
  name, label, unit, icon, placeholder, value,
  onChange, error,
}: {
  name: string; label: string; unit: string; icon: string;
  placeholder: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div
      className="flex-1 rounded-2xl p-4 space-y-3 border border-[hsl(var(--color-border))] bg-white"
      style={{ minWidth: "120px" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "hsl(var(--color-badge-bg))",
            color: "hsl(var(--color-badge-text))",
          }}
        >
          {unit}
        </span>
      </div>

      <input
        type="number"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-[22px] font-black outline-none bg-transparent placeholder:text-[hsl(var(--color-text-muted)/0.3)]"
        style={{ color: "hsl(var(--color-text))" }}
      />

      <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{label}</p>

      {error && <p className="text-red-500 text-[10px]">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  profile:       PatientProfile | null;
  onSaveSuccess: (updated: UpdatePatientProfilePayload) => void;
}

export default function VitalsForm({ profile, onSaveSuccess }: Props) {
  const [serverError,   setServerError]   = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const initialValues: VitalsFormValues = {
    weight: profile?.weight ?? "",
    height: profile?.height ?? "",
    pulse:  profile?.pulse  ?? "",  // ✅ بياخد القيمة من الـ profile
  };

  const handleSubmit = async (
    values: VitalsFormValues,
    { setSubmitting }: FormikHelpers<VitalsFormValues>
  ) => {
    try {
      setServerError("");
      setServerSuccess("");
      const payload: UpdatePatientProfilePayload = {
        weight: values.weight || undefined,
        height: values.height || undefined,
        pulse:  values.pulse  || undefined,  // ✅ بيتبعت دلوقتي
      };
      await updatePatientProfile(payload);
      setServerSuccess("Vitals updated!");
      onSaveSuccess(payload);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, errors, touched, isSubmitting }) => (
        <Form className="px-5 py-5 space-y-5">

          {/* Status */}
          {(serverError || serverSuccess) && (
            <div className={`px-4 py-3 text-[13px] font-medium rounded-xl flex items-center gap-2 ${
              serverError
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-green-50 border border-green-200 text-green-600"
            }`}>
              {serverSuccess && <LuCheck className="w-4 h-4 shrink-0" />}
              {serverError || serverSuccess}
            </div>
          )}

          {/* Note */}
          <p className="text-[11px] text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-xl">
            📅 Update these periodically to help your doctor track your health progress.
          </p>

          {/* Vital Cards */}
          <div className="flex gap-3 flex-wrap">
            <VitalCard
              name="weight" label="Weight" unit="kg" icon="⚖️"
              placeholder="75"
              value={values.weight}
              onChange={(v) => setFieldValue("weight", v)}
              error={touched.weight && errors.weight ? String(errors.weight) : undefined}
            />
            <VitalCard
              name="height" label="Height" unit="cm" icon="📏"
              placeholder="175"
              value={values.height}
              onChange={(v) => setFieldValue("height", v)}
              error={touched.height && errors.height ? String(errors.height) : undefined}
            />
            <VitalCard
              name="pulse" label="Pulse" unit="bpm" icon="💓"
              placeholder="72"
              value={values.pulse}
              onChange={(v) => setFieldValue("pulse", v)}
              error={touched.pulse && errors.pulse ? String(errors.pulse) : undefined}
            />
          </div>

          {/* BMI auto-calc */}
          {values.weight && values.height && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: "hsl(var(--color-primary)/0.07)" }}
            >
              <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                BMI (calculated)
              </span>
              <span className="text-[14px] font-black text-[hsl(var(--color-primary-strong))]">
                {(
                  Number(values.weight) /
                  Math.pow(Number(values.height) / 100, 2)
                ).toFixed(1)}
              </span>
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            style={{ background: "hsl(var(--color-primary))" }}
          >
            {isSubmitting
              ? <><ImSpinner2 className="w-4 h-4 animate-spin" /> Saving...</>
              : <><HiOutlineArrowRight className="w-4 h-4" /> Save Vitals</>
            }
          </button>
        </Form>
      )}
    </Formik>
  );
}
