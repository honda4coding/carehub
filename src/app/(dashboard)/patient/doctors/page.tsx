"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuSearch, LuCalendarPlus, LuTriangleAlert,
  LuClock, LuBriefcaseMedical, LuChevronDown, LuMapPin,
} from "react-icons/lu";

import {
  DoctorListItem, Slot,
  getApprovedDoctors, getAvailableSlots,
} from "@/services/appointmentService";
import { nextAvailableLabel, initialsOf } from "@/components/appointments/format";

const SPECIALTIES = ["All Specialties", "Cardiology", "General Practice", "Dermatology", "Orthopedics", "Neurology", "Pediatrics"];
const GOVERNORATES = ["All Locations", "Cairo", "Alexandria", "Giza", "Dakahlia", "Damietta", "Port Said", "Suez", "Sharqia", "Gharbia", "Menoufia"];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-bold bg-[hsl(var(--color-danger))] text-white">
      <LuTriangleAlert className="text-[15px]" />{message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100 ml-1">✕</button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 h-56">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
            <div className="flex-1">
              <div className="h-4 bg-[hsl(var(--color-border-soft))] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[hsl(var(--color-border-soft))] rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-[hsl(var(--color-border-soft))] rounded w-full mb-2" />
          <div className="h-10 bg-[hsl(var(--color-border-soft))] rounded-xl w-full mt-5" />
        </div>
      ))}
    </div>
  );
}

function SelectDropdown({ value, onChange, options, icon }: {
  value: string; onChange: (v: string) => void;
  options: string[]; icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px]">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-10 pr-9 py-2.5 text-[12.5px] font-semibold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 transition-all cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[13px] pointer-events-none" />
    </div>
  );
}

function DoctorCard({ doctor, onBook }: { doctor: DoctorListItem; onBook: (userId: string) => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const userId = doctor.userId._id;
  const fullName = doctor.userId.fullName;

  useEffect(() => {
    getAvailableSlots(userId).then(setSlots).catch(() => setSlots([])).finally(() => setLoadingSlots(false));
  }, [userId]);

  // Count how many unique weekdays this doctor has slots on
  const activeDaysCount = useMemo(() => {
    const days = new Set(slots.map((s) => new Date(s.startDateTime).getDay()));
    return days.size;
  }, [slots]);

  const nextLabel = useMemo(() => nextAvailableLabel(slots), [slots]);
  const initials = initialsOf(fullName);
  const hasSlots = !loadingSlots && slots.length > 0;

  return (
    <div className="group bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-sky-600/40 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-700 to-sky-500 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
          {doctor.profilepicture?.secure_url
            ? <img src={doctor.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
            : <span className="text-[20px] font-black text-white">{initials}</span>}
        </div>
        <div className="min-w-0 flex-1">
          {/* Name links to profile page */}
          <Link
            href={`/patient/doctors/${userId}`}
            className="text-[15px] font-black text-[hsl(var(--color-text))] truncate block hover:text-sky-700 transition-colors"
          >
            Dr. {fullName}
          </Link>
          <p className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mt-0.5">
            {doctor.specialization ?? "General Practice"}
          </p>
        </div>
      </div>

      {/* Stats: experience + days per week */}
      <div className="flex gap-2">
        {doctor.experience != null && (
          <div className="flex-1 bg-[hsl(var(--color-bg-soft))] rounded-xl p-2.5 text-center border border-[hsl(var(--color-border))]">
            <p className="text-[18px] font-black text-[hsl(var(--color-text))]">{doctor.experience}</p>
            <p className="text-[9px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Yrs Exp</p>
          </div>
        )}
        <div className="flex-1 bg-[hsl(var(--color-bg-soft))] rounded-xl p-2.5 text-center border border-[hsl(var(--color-border))]">
          <p className="text-[18px] font-black text-[hsl(var(--color-text))]">
            {loadingSlots ? "…" : activeDaysCount}
          </p>
          <p className="text-[9px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">Days/Week</p>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && <p className="text-[11.5px] text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2">{doctor.bio}</p>}

      {/* Next available */}
      <div className={`flex items-center gap-2 text-[11.5px] font-bold px-3 py-2 rounded-xl w-fit ${
        nextLabel ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]"
      }`}>
        <LuClock className="text-[13px] shrink-0" />
        {loadingSlots ? "Checking availability…" : nextLabel ? `Next: ${nextLabel}` : "No slots available"}
      </div>

      {/* Book button */}
      <button
        onClick={() => onBook(userId)}
        disabled={!hasSlots}
        className={`relative w-full py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden ${
          hasSlots
            ? "bg-gradient-to-r from-sky-700 to-sky-500 text-white shadow-[0_4px_15px_rgba(2,132,199,0.4)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed"
        }`}
      >
        {hasSlots && (
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        )}
        <LuCalendarPlus className="text-[15px] relative z-10" />
        <span className="relative z-10">{hasSlots ? "Book Now" : loadingSlots ? "Loading…" : "Unavailable"}</span>
      </button>
    </div>
  );
}

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [governorate, setGovernorate] = useState("All Locations");

  const showToast = useCallback((msg: string) => setToastMsg(msg), []);

  useEffect(() => {
    getApprovedDoctors()
      .then(setDoctors)
      .catch((err: any) => showToast(err?.message ?? "Failed to load doctors"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = useMemo(() =>
    doctors.filter((d) => {
      const name = d.userId.fullName.toLowerCase();
      const spec = (d.specialization ?? "").toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
      const matchSpec = specialty === "All Specialties" || d.specialization === specialty;
      return matchSearch && matchSpec;
    }),
    [doctors, search, specialty]
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4">
        <h1 className="text-[18px] md:text-[20px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">Doctor Directory</h1>
        <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">Browse our network of verified specialists</p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <SelectDropdown value={specialty} onChange={setSpecialty} options={SPECIALTIES} icon={<LuBriefcaseMedical />} />
          <SelectDropdown value={governorate} onChange={setGovernorate} options={GOVERNORATES} icon={<LuMapPin />} />
          <div className="relative">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-[14px]" />
            <input
              type="text" placeholder="Search by name…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-[12.5px] font-medium rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 transition-all"
            />
          </div>
        </div>

        {!loading && (
          <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mb-4">
            {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border-2 border-dashed border-[hsl(var(--color-border))] rounded-2xl py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-600/10 text-sky-600 flex items-center justify-center mx-auto mb-4 text-[26px]">
              <LuBriefcaseMedical />
            </div>
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">No doctors found</h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <DoctorCard
                key={d._id}
                doctor={d}
                onBook={(uid) => router.push(`/patient/doctors/${uid}/book`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}