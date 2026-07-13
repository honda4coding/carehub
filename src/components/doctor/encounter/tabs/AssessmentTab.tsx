"use client";
import React from "react";

import { LuPill } from "react-icons/lu";
import ClinicalAssessment from "@/components/doctor/encounter/ClinicalAssessment";

export interface AssessmentTabProps {
  symptoms: string; setSymptoms: React.Dispatch<React.SetStateAction<string>>;
  diagnosis: string; setDiagnosis: React.Dispatch<React.SetStateAction<string>>;
  setIsAssessmentMode: () => void;
  onProceedToPrescription: () => void;
}

export default function AssessmentTab({
  symptoms, setSymptoms,
  diagnosis, setDiagnosis,
  setIsAssessmentMode,
  onProceedToPrescription
}: AssessmentTabProps) {
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
          Proceed to Prescription <LuPill className="text-lg" />
        </button>
      </div>
    </div>
  );
}
