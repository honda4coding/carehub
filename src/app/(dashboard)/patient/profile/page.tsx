"use client";

import AvatarSection from "@/components/patients/profile/AvatarSection";
import BasicInfoForm from "@/components/patients/profile/BasicInfoForm";

import { usePatientProfile } from "@/context/PatientProfileContext";

export default function PatientProfilePage() {
  const {
    profile,
    loading,
    updateProfile,
    updateAvatar,
  } = usePatientProfile();

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
      <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-6 py-4">
        <h1 className="text-[16px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Profile
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Update your personal information and profile picture
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <main className="flex-1 p-6 space-y-5">
          <AvatarSection profile={profile} onUpdate={updateAvatar} />
          <BasicInfoForm profile={profile} onSaveSuccess={updateProfile} />
        </main>
      )}
    </div>
    </>
  );
}