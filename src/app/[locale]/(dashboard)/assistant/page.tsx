"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { LuLayoutDashboard, LuCalendarDays, LuUsers, LuActivity } from "react-icons/lu";
import { useTranslations } from "next-intl";

export default function AssistantDashboard() {
    const t = useTranslations("auto");
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader 
        title={t('assistantDashboard')} 
        subtitle={`Welcome back, ${user?.name}`} 
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="p-8 text-center bg-gradient-to-r from-[hsl(var(--color-primary)/0.1)] to-transparent border-none shadow-sm">
            <h1 className="text-3xl font-black mb-2 text-[hsl(var(--color-text))]">{t('hello')}{user?.name} 👋</h1>
            <p className="text-[hsl(var(--color-text-muted))] max-w-xl mx-auto">
              {t('welcomeToYourClinic')}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="p-6">
              <div className="w-12 h-12 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-2xl flex items-center justify-center mb-4">
                <LuCalendarDays size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[hsl(var(--color-text))]">{t('manageAppointments')}</h3>
              <p className="text-[hsl(var(--color-text-muted))] text-sm">
                {t('scheduleConfirmOrCancel')}</p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-2xl flex items-center justify-center mb-4">
                <LuUsers size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[hsl(var(--color-text))]">{t('patientRecords')}</h3>
              <p className="text-[hsl(var(--color-text-muted))] text-sm">
                {t('accessPatientDirectoriesAnd')}</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
