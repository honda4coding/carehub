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
        <Link href="/patient/doctors" className="text-[13px] font-semibold text-primary hover:underline">
          Back to directory
        </Link>
      </div>
    );
  }

  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);
  const specialization = doctor.specialization ?? "General Practice";

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
        
        {/* Main Card mimicking "Eclips" design */}
        <div className="bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-5 md:p-8 shadow-sm border border-[hsl(var(--color-border-soft))]">
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
            
            {/* Left: Large Photo */}
            <div className="w-[220px] sm:w-[260px] md:w-1/3 shrink-0">
              <div className="w-full aspect-[4/5] rounded-[2rem] bg-gradient-to-b from-[hsl(var(--color-primary)/0.2)] to-[hsl(var(--color-primary)/0.05)] flex items-center justify-center overflow-hidden border border-[hsl(var(--color-primary)/0.1)] shadow-sm">
                {doctor.profilepicture?.secure_url ? (
                  <img src={doctor.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[60px] font-black text-primary">{initials}</span>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col justify-center w-full">
              
              <h2 className="text-[26px] md:text-[32px] font-black text-[#0f172a] leading-tight tracking-tight text-center md:text-left mt-2 md:mt-0">
                Dr. {fullName}
              </h2>
              
              <p className="text-[14px] md:text-[15px] font-medium text-[hsl(var(--color-text-muted))] mt-1 mb-6 text-center md:text-left">
                Specialist in {specialization}
              </p>

              <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 py-2">
                
                {/* Clinics / Address */}
                <div>
                  <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <LuBuilding className="text-[14px]" /> Clinics & Address
                  </p>
                  <div className="flex items-start gap-2">
                    <LuMapPin className="text-primary mt-1 shrink-0" />
                    <p className="text-[14px] font-semibold text-[#334155] leading-snug">
                      {(doctor as any).address || "CareHub Main Clinic, Cairo Branch"}
                    </p>
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <LuPhone className="text-[14px]" /> Contact Numbers
                  </p>
                  <p className="text-[14px] font-bold text-[#334155]">
                    {doctor.userId.phone || doctor.userId.phoneNumber || "+20 123 456 7890"}
                  </p>
                  <p className="text-[12px] text-[#94a3b8] font-medium mt-0.5">Available for emergencies</p>
                </div>
              </div>

              <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

              {/* Certifications & Degrees */}
              <div className="py-2">
                <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <LuAward className="text-[14px]" /> Certifications & Degrees
                </p>
                <ul className="space-y-2">
                  {/* Real data mapping when available, using dummy templates for now */}
                  <li className="flex items-center gap-2 text-[14px] font-medium text-[#475569]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    MD from Cairo University
                  </li>
                  <li className="flex items-center gap-2 text-[14px] font-medium text-[#475569]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    Board Certified in {specialization}
                  </li>
                  <li className="flex items-center gap-2 text-[14px] font-medium text-[#475569]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    Member of Egyptian Medical Syndicate
                  </li>
                </ul>
              </div>

              {doctor.bio && (
                <>
                  <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>
                  <div className="py-2">
                    <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">About</p>
                    <p className="text-[14px] font-medium text-[#475569] leading-relaxed">
                      {doctor.bio}
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 mb-8">
            <div className="bg-[#f8fafc] rounded-2xl p-4 md:p-5 border border-[#e2e8f0] text-center md:text-left">
              <p className="text-[10px] md:text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Total Experience</p>
              <p className="text-[14px] md:text-[15px] font-black text-[#0f172a]">
                {doctor.experience != null ? `${doctor.experience}+ Years` : "Experienced"}
              </p>
            </div>
            
            <div className="bg-[#f8fafc] rounded-2xl p-4 md:p-5 border border-[#e2e8f0] text-center md:text-left">
              <p className="text-[10px] md:text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Verification</p>
              <p className="text-[14px] md:text-[15px] font-black text-[#0f172a]">Approved</p>
            </div>
            
            <div className="bg-[#f8fafc] rounded-2xl p-4 md:p-5 border border-[#e2e8f0] text-center md:text-left">
              <p className="text-[10px] md:text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Status</p>
              <p className="text-[14px] md:text-[15px] font-black text-[#0f172a]">Active</p>
            </div>
            
            <div className="bg-[#f8fafc] rounded-2xl p-4 md:p-5 border border-[#e2e8f0] text-center md:text-left">
              <p className="text-[10px] md:text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Rating</p>
              <p className="text-[14px] md:text-[15px] font-black text-[#0f172a] flex items-center justify-center md:justify-start gap-1">
                <LuStar className="text-amber-500 fill-amber-500 text-[14px]" /> (5.00)
              </p>
            </div>
          </div>

          {/* Book Button */}
          <button
            onClick={() => router.push(`/patient/doctors/${doctorId}/book`)}
            className="w-full py-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[16px] font-bold transition-all shadow-sm"
          >
            Book Appointment Now
          </button>

        </div>

      </main>
    </div>
  );
}