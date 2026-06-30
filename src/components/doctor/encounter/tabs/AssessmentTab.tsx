"use client";

import { LuPill } from "react-icons/lu";
import ClinicalAssessment from "@/components/doctor/encounter/ClinicalAssessment";
import { useTranslations } from "next-intl";

export interface AssessmentTabProps {
  symptoms: string; setSymptoms: (val: string) => void;
  diagnosis: string; setDiagnosis: (val: string) => void;
  setIsAssessmentMode: () => void;
  onProceedToPrescription: () => void;
}

export default function AssessmentTab({
  symptoms, setSymptoms,
  diagnosis, setDiagnosis,
  setIsAssessmentMode,
  onProceedToPrescription
}: AssessmentTabProps) {
    const t = useTranslations("auto");
  return (
    <div className="max-w-4xl mx-auto w-full">
      <ClinicalAssessment 
        symptoms={symptoms}
        setSymptoms={setSymptoms}
        diagnosis={diagnosis}
        setDiagnosis={setDiagnosis}
        setIsAssessmentMode={setIsAssessmentMode}
      />
      <div className="mt-8 flex justify-end">
        <button 
          onClick={onProceedToPrescription}
          className="bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          {t('proceedToPrescription')}<LuPill className="text-lg" />
        </button>
      </div>
    </div>
  );
}
