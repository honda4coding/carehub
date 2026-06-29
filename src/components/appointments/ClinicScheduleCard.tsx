"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuBuilding2, LuCalendarDays, LuClock, LuPencil } from "react-icons/lu";

import { Availability, getClinicAvailability } from "@/services/appointmentService";

const DAYS = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
] as const;

const DAY_LABELS: Record<string, string> = {
  sunday: "Sunday", monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday",
};

interface Props {
  clinicId: string;
  clinicName?: string;
  clinicAddress?: string;
  onLoaded?: (hasAvailability: boolean) => void;
}

/**
 * Read-only summary of a clinic's weekly schedule.
 * Editing happens on the clinic details page — this card just links there.
 */
export default function ClinicScheduleCard({
  clinicId,
  clinicName,
  clinicAddress,
  onLoaded,
}: Props) {
  const router = useRouter();
  const [availability, setAvailabilityList] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getClinicAvailability(clinicId);
        setAvailabilityList(data);
        if (onLoaded) onLoaded(data.length > 0);
      } catch {
        // silent — this is just a summary view
      } finally {
        setLoading(false);
      }
    })();
  }, [clinicId]);

  const activeDays = DAYS.filter((d) => availability.some((a) => a.day === d));

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0">
            <LuBuilding2 className="text-[16px]" />
          </div>
          <div>
            <p className="text-[14px] font-black text-[hsl(var(--color-text))] leading-tight">
              {clinicName || "Clinic"}
            </p>
            {clinicAddress ? (
              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                {clinicAddress}
              </p>
            ) : (
              <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wide">
                Weekly schedule
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            if (window.location.pathname.includes('/assistant')) {
              router.push(`/assistant/clinics/${clinicId}`);
            } else {
              router.push(`/doctor/clinics/${clinicId}`);
            }
          }}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--color-primary))] border border-[hsl(var(--color-primary)/0.3)] px-3 py-1.5 rounded-xl hover:bg-[hsl(var(--color-primary)/0.08)] transition-colors cursor-pointer shrink-0"
        >
          <LuPencil className="text-[12px]" /> Edit
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-lg bg-[hsl(var(--color-border-soft))] animate-pulse" />
          ))}
        </div>
      ) : activeDays.length === 0 ? (
        <div className="text-center py-6">
          <LuCalendarDays className="text-[22px] text-[hsl(var(--color-text-muted))] mx-auto mb-2" />
          <p className="text-[12.5px] font-semibold text-[hsl(var(--color-text-muted))]">
            No working days set yet for this clinic.
          </p>
          <button
            onClick={() => router.push(`/doctor/clinics/${clinicId}`)}
            className="text-[12px] font-bold text-[hsl(var(--color-primary))] mt-2 cursor-pointer"
          >
            Set it up →
          </button>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[hsl(var(--color-border))]">
          {activeDays.map((day) => {
            const entries = availability.filter((a) => a.day === day);
            return (
              <div key={day} className="flex items-center justify-between py-2.5 gap-3">
                <span className="text-[12.5px] font-bold text-[hsl(var(--color-text))] w-24 shrink-0">
                  {DAY_LABELS[day]}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end flex-1">
                  {entries.map((a) => (
                    <span
                      key={a._id}
                      className="flex items-center gap-1 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]"
                    >
                      <LuClock className="text-[11px] shrink-0" />
                      {a.startTime} – {a.endTime}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
