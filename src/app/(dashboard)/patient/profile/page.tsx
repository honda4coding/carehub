"use client";

import AvatarSection from "@/components/patients/profile/AvatarSection";
import BasicInfoForm from "@/components/patients/profile/BasicInfoForm";
import DashboardHeader from "@/components/global/DashboardHeader";
import { usePatientProfile } from "@/context/PatientProfileContext";

export default function PatientProfilePage() {
  const { profile, loading, updateProfile, updateAvatar } = usePatientProfile();

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <DashboardHeader
        title="Profile"
        subtitle="Update your personal information and profile picture"
        backPath="/patient"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
            <AvatarSection profile={profile} onUpdate={updateAvatar} />
            <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6"></div>
            <BasicInfoForm profile={profile} onSaveSuccess={updateProfile} />
          </div>
        </main>
      )}
    </div>
  );
}