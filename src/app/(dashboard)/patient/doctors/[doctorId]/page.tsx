"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft, LuCalendarPlus, LuBriefcaseMedical,
  LuStar, LuClock, LuUser,
} from "react-icons/lu";
import { DoctorListItem, getApprovedDoctors } from "@/services/appointmentService";
import { initialsOf } from "@/components/appointments/format";

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
        <Link href="/patient/doctors" className="text-[13px] font-semibold text-sky-600 hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);
  const specialization = doctor.specialization ?? "General Practice";

  // Marketing bullets — generated from available fields.
  // When the backend adds certifications/clinics, append them here.
  const highlights: { icon: React.ReactNode; text: string }[] = [
    ...(doctor.experience != null
      ? [{ icon: <LuClock />, text: `${doctor.experience}+ years of clinical experience` }]
      : []),
    { icon: <LuBriefcaseMedical />, text: `Specialist in ${specialization}` },
    { icon: <LuStar />, text: "Verified & approved by CareHub" },
  ];

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
        <h1 className="text-[17px] font-black text-[hsl(var(--color-text))]">Doctor Profile</h1>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-2xl mx-auto w-full space-y-4">

        {/* Hero card */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-sky-800 to-sky-600" />

          <div className="px-5 pb-6">
            {/* Avatar overlapping banner */}
            <div className="-mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-[hsl(var(--color-bg-surface))] bg-gradient-to-br from-sky-800 to-sky-500 flex items-center justify-center shadow-lg overflow-hidden">
                {doctor.profilepicture?.secure_url
                  ? <img src={doctor.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
                  : <span className="text-[28px] font-black text-white">{initials}</span>}
              </div>
            </div>

            <h2 className="text-[22px] font-black text-[hsl(var(--color-text))]">Dr. {fullName}</h2>
            <p className="text-[12px] font-bold text-sky-600 uppercase tracking-widest mt-0.5">{specialization}</p>
          </div>
        </div>

        {/* Experience stat — only shown if available */}
        {doctor.experience != null && (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex items-center gap-5">
            <div className="text-center shrink-0">
              <p className="text-[40px] font-black text-sky-700 leading-none">{doctor.experience}</p>
              <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mt-1">Years Experience</p>
            </div>
            <div className="h-14 w-px bg-[hsl(var(--color-border))]" />
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] leading-relaxed">
              Bringing over <strong className="text-[hsl(var(--color-text))]">{doctor.experience} years</strong> of
              dedicated practice in <strong className="text-[hsl(var(--color-text))]">{specialization}</strong> to
              every patient encounter.
            </p>
          </div>
        )}

        {/* Bio */}
        {doctor.bio && (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
            <h3 className="text-[13px] font-black text-[hsl(var(--color-text))] mb-3 flex items-center gap-2">
              <LuUser className="text-sky-600 shrink-0" /> About
            </h3>
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Why choose this doctor — marketing highlights */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
          <h3 className="text-[13px] font-black text-sky-800 mb-3 flex items-center gap-2">
            <LuStar className="shrink-0" /> Why choose Dr. {fullName.split(" ")[0]}?
          </h3>
          <ul className="space-y-2.5">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-3 text-[13px] font-semibold text-sky-700">
                <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-[14px] shrink-0">
                  {h.icon}
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Specialization badge */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-700 flex items-center justify-center shrink-0">
            <LuBriefcaseMedical className="text-white text-[20px]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-widest mb-0.5">Specialty</p>
            <p className="text-[15px] font-black text-[hsl(var(--color-text))]">{specialization}</p>
          </div>
        </div>

        {/* Book Now CTA — big and prominent */}
        <button
          onClick={() => router.push(`/patient/doctors/${doctorId}/book`)}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-800 to-sky-600 text-white text-[17px] font-black flex items-center justify-center gap-3 shadow-[0_6px_24px_rgba(2,132,199,0.45)] hover:shadow-[0_8px_30px_rgba(2,132,199,0.55)] hover:scale-[1.02] active:scale-[0.99] transition-all duration-300"
        >
          <LuCalendarPlus className="text-[22px]" />
          Book an Appointment
        </button>

        {/* Back link */}
        <div className="text-center pb-2">
          <Link href="/patient/doctors" className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] hover:text-sky-600 transition-colors">
            ← Back to all doctors
          </Link>
        </div>

      </main>
    </div>
  );
}