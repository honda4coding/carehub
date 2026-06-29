"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCalendarPlus, LuBriefcaseMedical,
  LuStar, LuClock, LuUser, LuMapPin, LuPhone, LuAward, LuBuilding
} from "react-icons/lu";
import { DoctorListItem, getApprovedDoctors } from "@/services/appointmentService";
import { initialsOf } from "@/components/appointments/format";

import DoctorProfileCard from "@/components/patients/doctors/DoctorProfileCard";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useTranslations } from "next-intl";

export default function DoctorProfilePage() {
  const t = useTranslations("patient.DoctorProfilePage");
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedDoctors()
      .then((list) => setDoctor(list.find((d) => d.userId._id === doctorId) ?? null))
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="p-6 space-y-4 animate-pulse max-w-2xl mx-auto w-full">
          <div className="h-36 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
          <div className="h-28 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
          <div className="h-40 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
          <div className="h-16 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen gap-3">
        <LuUser className="text-[40px] text-[hsl(var(--color-text-muted))]" />
        <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{t("doctorNotFound")}</p>
        <Link href="/patient/doctors" className="text-[14px] font-semibold text-[hsl(var(--color-primary))] hover:underline">
          {t("backToDirectory")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        backPath="/patient/doctors"
      />

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
        <DoctorProfileCard
          doctor={doctor}
          onBook={() => router.push(`/patient/doctors/${doctorId}/book`)}
        />
      </main>
    </div>
  );
}