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

export default function DoctorProfilePage() {
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
        <p className="text-[15px] font-black text-[hsl(var(--color-text))]">Doctor not found</p>
        <Link href="/patient/doctors" className="text-[14px] font-semibold text-[hsl(var(--color-primary))] hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center gap-3">
        <Link
          href="/patient/doctors"
          className="w-9 h-9 rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))] transition-all shrink-0"
        >
          <LuArrowLeft className="text-[14px]" />
        </Link>
        <h1 className="text-[17px] font-black text-[hsl(var(--color-text))]">Doctor Profile Details</h1>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
        <DoctorProfileCard
          doctor={doctor}
          onBook={() => router.push(`/patient/doctors/${doctorId}/book`)}
        />
      </main>
    </div>
  );
}