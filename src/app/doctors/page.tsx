"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  LuSearch,
  LuStethoscope,
  LuArrowRight,
  LuBriefcaseMedical,
  LuCircleCheck,
  LuCalendarPlus,
  LuX,
  LuSparkles,
} from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import CTASection from "@/components/landing/CTASection";
import { DoctorListItem } from "@/services/appointmentService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getPublicDoctors(page = 1, limit = 8): Promise<{ data: DoctorListItem[], pagination: { currentPage: number, totalPages: number, totalRecords: number } }> {
  const res = await fetch(`${BASE_URL}/doctor/global?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to load doctors");
  return await res.json();
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="p-6 !pt-6 flex flex-col h-full gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-text-muted)/0.08)] animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 rounded-full bg-[hsl(var(--color-text-muted)/0.08)] animate-pulse" />
            <div className="w-20 h-3 rounded-full bg-[hsl(var(--color-text-muted)/0.06)] animate-pulse" />
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-[hsl(var(--color-text-muted)/0.06)] animate-pulse" />
        <div className="w-4/5 h-3 rounded-full bg-[hsl(var(--color-text-muted)/0.06)] animate-pulse" />
        <div className="w-full h-11 rounded-[10px] bg-[hsl(var(--color-primary)/0.08)] animate-pulse mt-auto" />
      </CardContent>
    </Card>
  );
}

function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);
  const imageUrl = doctor.profilepicture?.secure_url || doctor.userId.profilepicture?.secure_url;

  return (
    <Card className="hover:-translate-y-1 hover:shadow-xl hover:border-[hsl(var(--color-primary)/0.3)] transition-all duration-300 group flex flex-col h-full">
      <CardContent className="p-6 !pt-6 flex flex-col h-full">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-14 h-14 rounded-2xl bg-[hsl(var(--color-primary)/0.08)] flex items-center justify-center shrink-0 border border-[hsl(var(--color-primary)/0.12)] overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-black text-[hsl(var(--color-primary))]">
                {initials}
              </span>
            )}
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(var(--color-success))] border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[hsl(var(--color-text))] truncate group-hover:text-[hsl(var(--color-primary))] transition-colors">
              Dr. {fullName}
            </h3>
            <p className="text-xs font-medium text-[hsl(var(--color-primary))] uppercase tracking-wider mt-0.5">
              {doctor.specialization ?? "General Practice"}
            </p>
          </div>
        </div>

        {/* Experience */}
        {doctor.experience != null && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))]">
              <LuBriefcaseMedical className="w-3.5 h-3.5 text-[hsl(var(--color-text-muted))]" />
              <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                {doctor.experience} yrs exp.
              </span>
            </div>
          </div>
        )}

        {/* Bio */}
        <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2 flex-1 mb-6">
          {doctor.bio ??
            `Specialist in ${doctor.specialization ?? "General Practice"}.`}
        </p>

        {/* CTA */}
        <Button href="/login" variant="primary" className="w-full mt-auto" icon={LuCalendarPlus}>
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoctorsPublicPage() {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getPublicDoctors(page)
      .then((res) => {
        setDoctors(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))]">
      {/* ── Hero ── */}
      <section className="w-full bg-[hsl(var(--color-bg))] pt-24 lg:pt-32 pb-16 px-6 lg:px-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(var(--color-primary)/0.05)] blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Badge variant="primary" className="gap-2">
              <LuSparkles className="w-4 h-4" />
              Verified Specialists
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pb-14 border-b border-[hsl(var(--color-text-muted)/0.08)]">
            <div className="flex flex-col gap-6 relative z-10">
              <h1 className="text-[clamp(36px,5vw,72px)] font-black tracking-tighter text-[hsl(var(--color-text))] leading-[1.05]">
                Find the right
                <br />
                doctor for
                <br />
                <span className="text-[hsl(var(--color-primary))]">
                  your care.
                </span>
              </h1>
              <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed max-w-md">
                Every doctor on CareHub is manually verified. Book your appointment instantly with our top specialists.
              </p>
            </div>
            
            {/* 3D Illustration */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute inset-0 bg-[hsl(var(--color-primary)/0.15)] rounded-full blur-[80px] scale-75 pointer-events-none" />
              <img 
                src="/images/doctor_hero.png" 
                alt="Doctor Illustration" 
                className="relative z-10 w-full max-w-[400px] lg:max-w-[480px] object-contain mix-blend-multiply dark:mix-blend-normal [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_70%)] hover:-translate-y-2 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="w-full px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2rem] p-12 text-center">
              <p className="text-[hsl(var(--color-danger))] font-bold">
                {error}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && doctors.length === 0 && (
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2.5rem] p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--color-primary)/0.08)] flex items-center justify-center mx-auto mb-5">
                <LuStethoscope className="w-7 h-7 text-[hsl(var(--color-primary))]" />
              </div>
              <h3 className="font-black text-[hsl(var(--color-text))] text-xl mb-2">
                No doctors found
              </h3>
              <p className="text-[hsl(var(--color-text-muted))] text-[14px] mb-6">
                There are currently no doctors with available appointments.
              </p>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && doctors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      {!loading && !error && (
        <CTASection />
      )}
    </main>
  );
}
