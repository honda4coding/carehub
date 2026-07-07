"use client";

import { LuClock, LuCalendarDays } from "react-icons/lu";
import { Appointment, getDisplayStatus } from "@/services/appointmentService";
import { initialsOf, isoTo12Hour } from "@/components/appointments/format";
import StatusBadge from "@/components/appointments/StatusBadge";

export default function ApptRow({ appt }: { appt: Appointment }) {
  const patient = typeof appt.patientId === "object" ? appt.patientId : null;
  const status = getDisplayStatus(appt);
  const dimmed = status === "cancelled";
  const timeLabel =
    isoTo12Hour(appt.startDateTime) +
    (appt.endDateTime ? " – " + isoTo12Hour(appt.endDateTime) : "");

  return (
    <div
      className={`group relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden mb-4 ${
        dimmed ? "opacity-60 saturate-50 hover:opacity-100" : ""
      }`}
    >
      <div className={`absolute top-0 bottom-0 left-0 w-[4px] rounded-l-2xl ${status === "upcoming" ? "bg-[hsl(var(--color-warning))]" : status === "completed" ? "bg-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-danger))]"}`} />
      
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] flex items-center justify-center text-[14px] font-black shrink-0">
          {initialsOf(patient?.fullName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[15px] font-black truncate ${
              dimmed ? "text-[hsl(var(--color-text-muted))] line-through" : "text-[hsl(var(--color-text))]"
            }`}
          >
            {patient?.fullName ?? "Patient"}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5 shrink-0">
              <LuCalendarDays className="text-[12px] shrink-0" />
              <span className="truncate">{new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </p>
            <p className="text-[12px] font-bold text-[hsl(var(--color-primary))] flex items-center gap-1.5 shrink-0">
              <LuClock className="text-[12px] shrink-0" />
              <span className="truncate">{timeLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end mt-1 sm:mt-0 pl-14 sm:pl-0">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

