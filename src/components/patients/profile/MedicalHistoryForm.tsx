"use client";

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ImSpinner2 } from "react-icons/im";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { LuDroplets, LuPlus, LuX, LuCheck, LuChevronDown, LuScissors } from "react-icons/lu";
import { useState, KeyboardEvent } from "react";
import { PatientProfile, UpdatePatientProfilePayload, updatePatientProfile } from "@/services/patientService";
import { MedicalHistoryFormValues, Surgery } from "@/types/profile";
import { useTranslations } from "next-intl";

// ─── Constants ────────────────────────────────────────────────────────────────
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = Yup.object({
  bloodType: Yup.string().oneOf(BLOOD_TYPES).optional(),
  allergies: Yup.array().of(Yup.string()).optional(),
  chronic:   Yup.array().of(Yup.string()).optional(),
  surgeries: Yup.array().of(
    Yup.object({
      operationName: Yup.string().required("Operation name is required"),
      surgeonName:   Yup.string().required("Surgeon name is required"),
      date:          Yup.string().required("Date is required"),
      report:        Yup.string().required("Report is required"),
    })
  ).optional(),
});

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ label, icon, placeholder, tags, onAdd, onRemove }: {
  label: string; icon: React.ReactNode; placeholder: string;
  tags: string[]; onAdd: (tag: string) => void; onRemove: (i: number) => void;
}) {
    const t = useTranslations("auto");
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) { onAdd(trimmed); setInput(""); }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    if (e.key === "Backspace" && input === "" && tags.length > 0) onRemove(tags.length - 1);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
        <span>{icon}</span>{label}
      </label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))]">
              {tag}
              <button type="button" onClick={() => onRemove(i)} className="hover:text-danger transition-colors ms-0.5">
                <LuX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} placeholder={placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)]"
            style={{ backgroundColor: "white", border: "1px solid hsl(var(--color-border))", color: "hsl(var(--color-text))" }}
          />
          <button type="button" onClick={handleAdd} disabled={!input.trim()}
          className="px-3 py-2.5 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] hover:opacity-80 transition-opacity disabled:opacity-30">
          <LuPlus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-[hsl(var(--color-text-muted))] ps-1">{t('pressEnterOrTo')}</p>
    </div>
  );
}

// ─── Surgery Card ─────────────────────────────────────────────────────────────
function SurgeryCard({ index, surgery, onRemove }: {
  index: number; surgery: Surgery; onRemove: () => void;
}) {
    const t = useTranslations("auto");
  const [open, setOpen] = useState(!surgery.operationName);

  return (
    <div className="border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-bg-soft)/0.7)] transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <LuScissors className="w-3.5 h-3.5 text-[hsl(var(--color-primary-strong))]" />
          <span className="text-[13px] font-bold text-[hsl(var(--color-text))] truncate max-w-[180px]">
            {surgery.operationName || `Surgery ${index + 1}`}
          </span>
          {surgery.date && (
            <span className="text-[11px] text-[hsl(var(--color-text-muted))]">· {surgery.date}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-6 h-6 rounded-full bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center justify-center hover:opacity-80">
            <LuX className="w-3 h-3" />
          </button>
          <LuChevronDown className={`w-4 h-4 text-[hsl(var(--color-text-muted))] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3 bg-white">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{t('operationName')}</label>
            <Field name={`surgeries.${index}.operationName`} placeholder={t('egAppendectomy')}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
              style={{ border: "1px solid hsl(var(--color-border))", color: "hsl(var(--color-text))" }} />
            <ErrorMessage name={`surgeries.${index}.operationName`} component="p" className="text-danger text-[11px] ps-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{t('surgeonName_jhj7')}</label>
              <Field name={`surgeries.${index}.surgeonName`} placeholder={t('drAhmedAli')}
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ border: "1px solid hsl(var(--color-border))", color: "hsl(var(--color-text))" }} />
              <ErrorMessage name={`surgeries.${index}.surgeonName`} component="p" className="text-danger text-[11px] ps-1" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{t('date_1s1k')}</label>
              <Field type="date" name={`surgeries.${index}.date`}
                className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ border: "1px solid hsl(var(--color-border))", color: "hsl(var(--color-text))" }} />
              <ErrorMessage name={`surgeries.${index}.date`} component="p" className="text-danger text-[11px] ps-1" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{t('reportNotes')}</label>
            <Field as="textarea" rows={3} name={`surgeries.${index}.report`}
              placeholder={t('briefDescription')}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
              style={{ border: "1px solid hsl(var(--color-border))", color: "hsl(var(--color-text))" }} />
            <ErrorMessage name={`surgeries.${index}.report`} component="p" className="text-danger text-[11px] ps-1" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  profile:       PatientProfile | null;
  onSaveSuccess: (updated: UpdatePatientProfilePayload) => void;
}

export default function MedicalHistoryForm({ profile, onSaveSuccess }: Props) {
    const t = useTranslations("auto");
  const [serverError,   setServerError]   = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  const initialValues: MedicalHistoryFormValues = {
    bloodType: (profile?.bloodType as MedicalHistoryFormValues["bloodType"]) ?? "",
    allergies: profile?.allergies ?? [],
    chronic:   profile?.chronic   ?? [],
    surgeries: profile?.surgeries ?? [],
  };

  const handleSubmit = async (
    values: MedicalHistoryFormValues,
    { setSubmitting }: FormikHelpers<MedicalHistoryFormValues>
  ) => {
    try {
      setServerError("");
      setServerSuccess("");
      const payload: UpdatePatientProfilePayload = {
        bloodType: values.bloodType || undefined,
        allergies: values.allergies,
        chronic:   values.chronic,
        surgeries: values.surgeries,
      };
      await updatePatientProfile(payload);
      setServerSuccess("Medical history updated!");
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
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="px-5 py-5 space-y-5">

          {/* Status */}
          {(serverError || serverSuccess) && (
            <div className={`px-4 py-3 text-[13px] font-medium rounded-xl flex items-center gap-2 ${
              serverError ? "bg-danger-light border border-red-200 text-danger" : "bg-success-light border border-green-200 text-success"
            }`}>
              {serverSuccess && <LuCheck className="w-4 h-4 shrink-0" />}
              {serverError || serverSuccess}
            </div>
          )}

          {/* Blood Type */}
          <div className="space-y-1.5">
            <label htmlFor="bloodType" className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
              <LuDroplets className="w-3.5 h-3.5" /> {t('bloodType')}</label>
            <div className="relative">
              <Field as="select" id="bloodType" name="bloodType"
                className="w-full px-4 py-3 rounded-xl text-[13px] outline-none appearance-none cursor-pointer"
                style={{ backgroundColor: "white", border: "1px solid hsl(var(--color-border))", color: "hsl(var(--color-text))" }}>
                <option value="">{t('selectBloodType_d8y6')}</option>
                {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </Field>
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">▾</span>
            </div>
          </div>

          {/* Allergies */}
          <TagInput
            label={t('allergies')} icon="🤧" placeholder={t('egPenicillinPeanuts_x238')}
            tags={values.allergies}
            onAdd={(tag) => setFieldValue("allergies", [...values.allergies, tag])}
            onRemove={(i) => setFieldValue("allergies", values.allergies.filter((_, idx) => idx !== i))}
          />

          {/* Chronic */}
          <TagInput
            label={t('chronicDiseases')} icon="🏥" placeholder={t('egDiabetesHypertension')}
            tags={values.chronic}
            onAdd={(tag) => setFieldValue("chronic", [...values.chronic, tag])}
            onRemove={(i) => setFieldValue("chronic", values.chronic.filter((_, idx) => idx !== i))}
          />

          {/* Surgeries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                <LuScissors className="w-3.5 h-3.5" />
                {t('surgeries')}{values.surgeries.length > 0 && (
                  <span className="ms-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))]">
                    {values.surgeries.length}
                  </span>
                )}
              </label>
              <button type="button"
                onClick={() => setFieldValue("surgeries", [
                  ...values.surgeries,
                  { operationName: "", surgeonName: "", date: "", report: "" }
                ])}
                className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] hover:opacity-80 transition-opacity">
                <LuPlus className="w-3.5 h-3.5" /> {t('addSurgery')}</button>
            </div>
            {values.surgeries.length === 0 && (
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] italic ps-1">{t('noSurgeriesAddedYet_2au5')}</p>
            )}
            <div className="space-y-2">
              {values.surgeries.map((surgery, index) => (
                <SurgeryCard
                  key={index} index={index} surgery={surgery}
                  onRemove={() => setFieldValue("surgeries", values.surgeries.filter((_, i) => i !== index))}
                />
              ))}
            </div>
          </div>

          {/* Save */}
          <button type="submit" disabled={isSubmitting}
            className="w-full py-3 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            style={{ background: "hsl(var(--color-primary))" }}>
            {isSubmitting
              ? <><ImSpinner2 className="w-4 h-4 animate-spin" /> {t('saving')}</>
              : <><HiOutlineArrowRight className="w-4 h-4" /> {t('saveMedicalHistory')}</>
            }
          </button>
        </Form>
      )}
    </Formik>
  );
}
