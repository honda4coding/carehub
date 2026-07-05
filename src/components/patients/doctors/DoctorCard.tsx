import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LuClock, LuCalendarPlus } from "react-icons/lu";

import { DoctorListItem, Slot, getAvailableSlots } from "@/services/appointmentService";
import { nextAvailableLabel, initialsOf } from "@/components/appointments/format";

export default function DoctorCard({ doctor, onBook }: { doctor: DoctorListItem; onBook: (userId: string) => void }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const userId = doctor.userId._id;
  const fullName = doctor.userId.fullName;

  useEffect(() => {
    getAvailableSlots(userId)
      .then((res) => {
        console.log(`[Slots for ${doctor.userId?.fullName || userId}]`, res);
        setSlots(res);
      })
      .catch((err) => {
        console.error(`[Error fetching slots for ${doctor.userId?.fullName || userId}]`, err);
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [userId, doctor]);

  // Count how many unique weekdays this doctor has slots on
  const activeDaysCount = useMemo(() => {
    const days = new Set(slots.map((s) => new Date(s.startDateTime).getDay()));
    return days.size;
  }, [slots]);

  const nextLabel = useMemo(() => nextAvailableLabel(slots), [slots]);
  const initials = initialsOf(fullName);
  const hasSlots = !loadingSlots && slots.length > 0;

  return (
    <div className="group bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 md:p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[var(--shadow-float)] hover:border-[hsl(var(--color-primary)/0.3)] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0 border border-[hsl(var(--color-primary)/0.2)] overflow-hidden">
          {doctor.userId.profilepicture?.secure_url
            ? <img src={doctor.userId.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
            : <span className="text-xl font-bold text-[hsl(var(--color-primary))]">{initials}</span>}
        </div>
        <div className="min-w-0 flex-1">
          {/* Name links to profile page */}
          <Link
            href={`/patient/doctors/${userId}`}
            className="text-lg font-semibold text-[hsl(var(--color-text))] tracking-tight truncate block hover:text-[hsl(var(--color-primary-strong))] transition-colors"
          >
            Dr. {fullName}
          </Link>
          <p className="text-xs font-semibold text-[hsl(var(--color-primary))] uppercase tracking-wider mt-0.5">
            {doctor.specialization ?? "General Practice"}
          </p>
        </div>
      </div>

      {/* Stats: experience + days per week */}
      <div className="flex gap-2">
        {doctor.experience != null && (
          <div className="flex-1 bg-[hsl(var(--color-bg-soft))] rounded-xl p-2.5 text-center border border-[hsl(var(--color-border))]">
            <p className="text-xl font-bold tracking-tight text-[hsl(var(--color-text))]">{doctor.experience}</p>
            <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-widest opacity-90">Yrs Exp</p>
          </div>
        )}
        <div className="flex-1 bg-[hsl(var(--color-bg-soft))] rounded-xl p-2.5 text-center border border-[hsl(var(--color-border))]">
          <p className="text-xl font-bold tracking-tight text-[hsl(var(--color-text))]">
            {loadingSlots ? "…" : activeDaysCount}
          </p>
          <p className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-widest opacity-90">Days/Week</p>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2">{doctor.bio}</p>}

      {/* Next available */}
      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl w-fit ${
        nextLabel ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] border border-[hsl(var(--color-success)/0.2)]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] border border-[hsl(var(--color-border))]"
      }`}>
        <LuClock className="text-[14px] shrink-0" />
        {loadingSlots ? "Checking availability…" : nextLabel ? `Next: ${nextLabel}` : "No slots available"}
      </div>

      {/* Book button */}
      <button
        onClick={() => onBook(userId)}
        disabled={!hasSlots}
        className={`relative w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden cursor-pointer ${
          hasSlots
            ? "bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-strong))] hover:scale-[1.02] active:scale-[0.98]"
            : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed"
        }`}
      >
        {hasSlots && (
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
        )}
        <LuCalendarPlus className="w-5 h-5 relative z-10" />
        <span className="relative z-10">{hasSlots ? "Book Now" : loadingSlots ? "Loading…" : "Unavailable"}</span>
      </button>
    </div>
  );
}
