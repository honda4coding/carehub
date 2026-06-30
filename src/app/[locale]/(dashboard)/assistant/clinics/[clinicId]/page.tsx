"use client";

import { useParams } from "next/navigation";
import DashboardHeader from "@/components/global/DashboardHeader";
import ClinicDetailsPanel from "@/components/clinics/ClinicDetailsPanel";
import { useTranslations } from "next-intl";

export default function AssistantClinicDetailsPage() {
    const t = useTranslations("auto");
  const params = useParams();
  const clinicId = params?.clinicId as string;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title={t('clinicDetails')}
        subtitle={t('viewAndManageClinic')}
        backPath="/assistant/appointments/schedule"
      />
      <div className="p-4 md:p-6 flex-1 overflow-auto">
        <ClinicDetailsPanel clinicId={clinicId} />
      </div>
    </div>
  );
}
