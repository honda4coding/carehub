"use client";

import MedicalHistoryForm from "@/components/patients/profile/MedicalHistoryForm";
import { usePatientProfile } from "@/context/PatientProfileContext";

export default function MedicalPage() {
  const { profile, loading, updateProfile } =
    usePatientProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
          {/* Page title */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-6 py-4">
        <h1 className="text-[16px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Medical History
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          View and update your medical information
        </p>
      </header>
    <div className="flex-1 p-6 space-y-5 ">
      <MedicalHistoryForm
        profile={profile}
        onSaveSuccess={updateProfile}
      />
    </div>
    </>
  );
}