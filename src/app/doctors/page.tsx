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
import { DoctorListItem } from "@/services/appointmentService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getPublicDoctors(): Promise<DoctorListItem[]> {
  const res = await fetch(`${BASE_URL}/doctor/global`);
  if (!res.ok) throw new Error("Failed to load doctors");
  const json = await res.json();
  return json.data ?? json;
}

const SPECIALTIES = [
  "All",
  "Cardiology",
  "General Practice",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Gynecology",
  "Psychiatry",
  "Ophthalmology",
  "ENT",
  "Urology",
];

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
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2rem] p-7 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-text-muted)/0.08)] animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 rounded-full bg-[hsl(var(--color-text-muted)/0.08)] animate-pulse" />
          <div className="w-20 h-3 rounded-full bg-[hsl(var(--color-text-muted)/0.06)] animate-pulse" />
        </div>
      </div>
      <div className="w-full h-3 rounded-full bg-[hsl(var(--color-text-muted)/0.06)] animate-pulse" />
      <div className="w-4/5 h-3 rounded-full bg-[hsl(var(--color-text-muted)/0.06)] animate-pulse" />
      <div className="w-full h-11 rounded-2xl bg-[hsl(var(--color-primary)/0.08)] animate-pulse mt-1" />
    </div>
  );
}

// ─── Doctor Card ───────────────────────────────────────────────────────────────
function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2rem] p-7 hover:-translate-y-2 hover:shadow-xl hover:shadow-[hsl(var(--color-primary)/0.08)] hover:border-[hsl(var(--color-primary)/0.25)] transition-all duration-300 group flex flex-col">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-14 h-14 rounded-2xl bg-[hsl(var(--color-primary)/0.08)] flex items-center justify-center shrink-0 border border-[hsl(var(--color-primary)/0.12)] overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {doctor.profilepicture?.secure_url ? (
            <img
              src={doctor.profilepicture.secure_url}
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
          <h3 className="text-[15px] font-black text-[hsl(var(--color-text))] truncate">
            Dr. {fullName}
          </h3>
          <p className="text-[11px] font-bold text-[hsl(var(--color-primary))] uppercase tracking-widest mt-0.5">
            {doctor.specialization ?? "General Practice"}
          </p>
        </div>
      </div>

      {/* Experience */}
      {doctor.experience != null && (
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-text-muted)/0.08)]">
            <LuBriefcaseMedical className="w-3 h-3 text-[hsl(var(--color-text-muted))]" />
            <span className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">
              {doctor.experience} yrs experience
            </span>
          </div>
        </div>
      )}

      {/* Bio */}
      <p className="text-[13px] text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2 flex-1 mb-5">
        {doctor.bio ??
          `Specialist in ${doctor.specialization ?? "General Practice"}.`}
      </p>

      {/* Verified */}
      <div className="flex items-center gap-1.5 text-[hsl(var(--color-success))] mb-4">
        <LuCircleCheck className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Verified by CareHub
        </span>
      </div>

      {/* CTA */}
      <Link
        href="/login"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[hsl(var(--color-primary))] text-white font-black text-[13px] hover:bg-[hsl(var(--color-primary-strong))] hover:shadow-lg hover:shadow-[hsl(var(--color-primary)/0.25)] transition-all duration-300"
      >
        <LuCalendarPlus className="w-4 h-4" />
        Book Appointment
        <LuArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DoctorsPublicPage() {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  useEffect(() => {
    getPublicDoctors()
      .then(setDoctors)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const name = d.userId.fullName.toLowerCase();
      const spec = (d.specialization ?? "").toLowerCase();
      const q = search.toLowerCase();
      return (
        (!q || name.includes(q) || spec.includes(q)) &&
        (specialty === "All" || spec.includes(specialty.toLowerCase()))
      );
    });
  }, [doctors, search, specialty]);

  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))]">
      {/* ── Hero ── */}
      <section className="w-full bg-[hsl(var(--color-bg))] pt-24 lg:pt-32 pb-16 px-6 lg:px-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(var(--color-primary)/0.05)] blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Badge variant="primary" className="gap-2">
              <LuSparkles className="w-4 h-4" />
              {loading
                ? "Loading..."
                : `${doctors.length} Verified Specialists`}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end pb-14 border-b border-[hsl(var(--color-text-muted)/0.08)]">
            <h1 className="text-[clamp(36px,5vw,72px)] font-black tracking-tighter text-[hsl(var(--color-text))] leading-[1.05]">
              Find the right
              <br />
              doctor for
              <br />
              <span className="text-[hsl(var(--color-primary))]">
                your care.
              </span>
            </h1>
            <div>
              <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed mb-8 max-w-md">
                Every doctor on CareHub is manually verified. Browse by
                specialty and book your appointment in seconds.
              </p>
              {/* Search */}
              <div className="relative">
                <LuSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 rounded-2xl border border-[hsl(var(--color-text-muted)/0.15)] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] text-[15px] outline-none focus:border-[hsl(var(--color-primary))] focus:shadow-[0_0_0_4px_hsl(var(--color-primary)/0.08)] transition-all placeholder:text-[hsl(var(--color-text-muted)/0.4)] shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[hsl(var(--color-text-muted)/0.1)] flex items-center justify-center hover:bg-[hsl(var(--color-text-muted)/0.2)] transition-colors"
                  >
                    <LuX className="w-3.5 h-3.5 text-[hsl(var(--color-text-muted))]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Specialty pills */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-6">
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(s)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                  specialty === s
                    ? "bg-[hsl(var(--color-primary))] text-white shadow-lg shadow-[hsl(var(--color-primary)/0.25)]"
                    : "bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.12)] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-primary)/0.4)] hover:text-[hsl(var(--color-primary))]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="w-full px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Count */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                {filtered.length === 0
                  ? "No doctors found"
                  : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""}`}
                {specialty !== "All" && (
                  <span className="ml-1">
                    ·{" "}
                    <span className="font-bold text-[hsl(var(--color-primary))]">
                      {specialty}
                    </span>
                  </span>
                )}
              </p>
              {(search || specialty !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSpecialty("All");
                  }}
                  className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors flex items-center gap-1"
                >
                  <LuX className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          )}

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
          {!loading && !error && filtered.length === 0 && (
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2.5rem] p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--color-primary)/0.08)] flex items-center justify-center mx-auto mb-5">
                <LuStethoscope className="w-7 h-7 text-[hsl(var(--color-primary))]" />
              </div>
              <h3 className="font-black text-[hsl(var(--color-text))] text-xl mb-2">
                No doctors found
              </h3>
              <p className="text-[hsl(var(--color-text-muted))] text-[14px] mb-6">
                Try a different name or specialty.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSpecialty("All");
                }}
                className="px-6 py-3 rounded-2xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary-strong))] font-bold text-[13px] hover:bg-[hsl(var(--color-primary)/0.15)] transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Doctor CTA ── */}
      {!loading && !error && (
        <section className="w-full py-24 px-6 lg:px-10 bg-[hsl(var(--color-bg-soft))]">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[hsl(var(--color-primary))] rounded-[2.5rem] p-12 lg:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div>
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-3">
                    For Doctors
                  </p>
                  <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                    Are you a doctor?
                    <br />
                    Join CareHub.
                  </h2>
                </div>
                <Link href="/register?role=doctor" className="shrink-0">
                  <Button
                    size="lg"
                    className="
    bg-[hsl(var(--color-bg))]
    text-white
    hover:bg-[hsl(var(--color-bg-surface))]
    border border-white/10
    shadow-xl
    hover:shadow-2xl
    transition-all
    duration-300
    rounded-2xl
    px-8
    h-14
    font-semibold
  "
                  >
                    Join as Doctor
                    <LuArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
