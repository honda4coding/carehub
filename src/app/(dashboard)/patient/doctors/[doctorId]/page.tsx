"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCalendarPlus, LuBriefcaseMedical,
  LuStar, LuClock, LuUser, LuMapPin, LuPhone, LuAward, LuBuilding
} from "react-icons/lu";
import { DoctorListItem, getApprovedDoctors, getMyAppointments } from "@/services/appointmentService";
import { initialsOf } from "@/components/appointments/format";

import DoctorProfileCard from "@/components/patients/doctors/DoctorProfileCard";
import DashboardHeader from "@/components/global/DashboardHeader";

import { Clinic, getDoctorClinics } from "@/services/clinicService";

export default function DoctorProfilePage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorListItem | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [hasBooked, setHasBooked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getApprovedDoctors(),
      getDoctorClinics(doctorId).catch(() => []), // Gracefully fail if no clinics
      getMyAppointments({ limit: 100 }).catch(() => ({ data: [] }))
    ])
      .then(([list, fetchedClinics, appointments]) => {
        setDoctor(list.find((d) => d.userId._id === doctorId) ?? null);
        setClinics(fetchedClinics);
        
        const isBooked = appointments.data?.some(
          (app) => app.doctorId?._id === doctorId && app.status === "booked"
        );
        setHasBooked(!!isBooked);
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8 animate-pulse">
          {/* Hero Skeleton */}
          <div className="h-64 rounded-[2rem] bg-[hsl(var(--color-border-soft))]" />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column (About & Certs) Skeleton */}
            <div className="xl:col-span-2 space-y-8">
              <div className="h-48 rounded-[2rem] bg-[hsl(var(--color-border-soft))]" />
              <div className="h-64 rounded-[2rem] bg-[hsl(var(--color-border-soft))]" />
            </div>
            
            {/* Right Column (Clinics) Skeleton */}
            <div className="space-y-8">
              <div className="h-80 rounded-[2rem] bg-[hsl(var(--color-border-soft))]" />
            </div>
          </div>
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
      <DashboardHeader
        title="Doctor Profile Details"
        subtitle="View doctor information and book an appointment"
        showBack={true}
      />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <DoctorProfileCard
          doctor={doctor}
          clinics={clinics}
          hasBooked={hasBooked}
          onBook={() => router.push(`/patient/doctors/${doctorId}/book`)}
        />
      </main>
    </div>
  );
}