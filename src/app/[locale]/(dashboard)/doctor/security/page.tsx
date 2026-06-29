"use client";

import DashboardHeader from "@/components/global/DashboardHeader";
import UpdatePasswordForm from "@/components/settings/UpdatePasswordForm";
import { useTranslations } from "next-intl";

export default function DoctorSecurityPage() {
    const t = useTranslations("auto");
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <DashboardHeader
        title={t('security')}
        subtitle="Update your password and account security"
        backPath="/doctor"
      />
      <main className="flex-1 p-6 flex justify-center items-start pt-12">
        <UpdatePasswordForm />
      </main>
    </div>
  );
}
