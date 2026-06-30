"use client";

import { useRouter } from "next/navigation";
import AvatarSection from "@/components/patients/profile/AvatarSection";
import BasicInfoForm from "@/components/patients/profile/BasicInfoForm";
import DeleteAccountModal from "@/components/shared/DeleteAccountModal";
import DashboardHeader from "@/components/global/DashboardHeader";
import { usePatientProfile } from "@/context/PatientProfileContext";
import { deletePatientAccount } from "@/services/patientService";
import { useTranslations } from "next-intl";

export default function PatientProfilePage() {
    const t = useTranslations("auto");
  const router = useRouter();
  const { profile, loading, updateProfile, updateAvatar } = usePatientProfile();

  const handleDeleteAccount = async () => {
    await deletePatientAccount();
    router.replace("/");
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <DashboardHeader
        title={t('profile')}
        subtitle={t('updateYourPersonalInformation')}
        backPath="/patient"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-4">

          {/* الكارد الأصلي — لم يتغير */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
            <AvatarSection profile={profile} onUpdate={updateAvatar} />
            <div className="border-t border-dashed border-[hsl(var(--color-border-soft))] mx-6"></div>
            <BasicInfoForm profile={profile} onSaveSuccess={updateProfile} />
          </div>

          {/* Danger Zone — مضاف */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6">
              <h3 className="text-[14px] font-black text-[hsl(var(--color-danger))] mb-1">{t('dangerZone')}</h3>
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] mb-5">
                {t('permanentlyDeleteYourAccount')}</p>
              <DeleteAccountModal onConfirm={handleDeleteAccount} />
            </div>
          </div>

        </main>
      )}
    </div>
  );
}