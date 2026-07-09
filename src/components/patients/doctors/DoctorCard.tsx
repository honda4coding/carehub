import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LuClock, LuCalendarPlus, LuCalendar, LuAward } from "react-icons/lu";

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
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0 border-[2px] border-[hsl(var(--color-bg-surface))] ring-2 ring-[hsl(var(--color-primary)/0.15)] overflow-hidden mt-0.5">
          {doctor.userId.profilepicture?.secure_url
            ? <img src={doctor.userId.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
            : <span className="text-xl font-bold text-[hsl(var(--color-primary))]">{initials}</span>}
        </div>
        <div className="min-w-0 flex-1">
          {/* Name links to profile page */}
          <Link
            href={`/patient/doctors/${userId}`}
            className="text-lg font-semibold text-[hsl(var(--color-text))] tracking-tight line-clamp-2 break-words hover:text-[hsl(var(--color-primary-strong))] transition-colors leading-tight"
          >
            Dr. {fullName}
          </Link>
          <p className="text-xs font-semibold text-[hsl(var(--color-primary))] uppercase tracking-wider mt-1 truncate">
            {doctor.specialization ?? "General Practice"}
          </p>
        </div>
      </div>

      {/* Stats: experience + days per week */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-1">
        {doctor.experience != null && (
          <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-primary)/0.08)] flex items-center justify-center text-[hsl(var(--color-primary-strong))] shrink-0">
              <LuAward className="text-[14px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-[hsl(var(--color-text))] leading-none truncate">{doctor.experience}</span>
              <span className="text-[9.5px] font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-widest mt-1 truncate">Yrs Exp</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-primary)/0.08)] flex items-center justify-center text-[hsl(var(--color-primary-strong))] shrink-0">
            <LuCalendar className="text-[14px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[hsl(var(--color-text))] leading-none truncate">{loadingSlots ? "…" : activeDaysCount}</span>
            <span className="text-[9.5px] font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-widest mt-1 truncate">Days/Week</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && <p className="text-[13px] text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2 mt-1">{doctor.bio}</p>}

      {/* Next available */}
      <div className={`flex items-center gap-2 text-[12.5px] font-medium mt-1 min-w-0 ${
        nextLabel ? "text-[hsl(var(--color-success))]" : "text-[hsl(var(--color-text-muted))]"
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${nextLabel ? 'bg-[hsl(var(--color-success))] animate-pulse' : 'bg-[hsl(var(--color-text-muted))]'}`} />
        <span className="truncate">{loadingSlots ? "Checking availability…" : nextLabel ? `Next slot: ${nextLabel}` : "No slots available"}</span>
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
