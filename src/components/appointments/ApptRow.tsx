"use client";

import { LuClock } from "react-icons/lu";
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
      className={`group relative flex flex-col sm:flex-row bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:border-[hsl(var(--color-primary)/0.3)] transition-all duration-300 mb-4 overflow-hidden ${
        dimmed ? "opacity-60 saturate-50 hover:opacity-100 transition-opacity" : ""
      }`}
    >
      {/* Date stub */}
      <div
        className={`w-full sm:w-[120px] shrink-0 flex sm:flex-col items-center justify-between sm:justify-center px-6 py-4 sm:p-0 sm:border-r border-b sm:border-b-0 border-[hsl(var(--color-border))] relative z-10 ${
          status === "upcoming"
            ? "bg-gradient-to-br from-[hsl(var(--color-warning-bg))] to-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-warning))]"
            : status === "completed"
            ? "bg-gradient-to-br from-[hsl(var(--color-success-bg))] to-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-success))]"
            : "bg-gradient-to-br from-[hsl(var(--color-danger-bg))] to-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-danger))]"
        }`}
      >
        <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
          <span className="text-[12px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">
            {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-[24px] sm:text-[32px] font-black leading-none tracking-tighter text-[hsl(var(--color-text))] sm:my-1">
            {new Date(appt.appointmentDate).getDate()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 sm:mt-2">
          <LuClock className="text-[11px]" />
          <span className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">
            {isoTo12Hour(appt.startDateTime)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-[hsl(var(--color-bg-surface))] relative overflow-hidden">
        {/* Subtle background glow based on status */}
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
          status === "upcoming" ? "bg-[hsl(var(--color-warning))]" : status === "completed" ? "bg-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-danger))]"
        }`}></div>

        <div className="flex items-center gap-4 min-w-0 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] shadow-sm flex items-center justify-center text-[15px] font-black shrink-0">
            {initialsOf(patient?.fullName)}
          </div>
          <div className="min-w-0">
            <p
              className={`text-[15px] font-black truncate ${
                dimmed
                  ? "text-[hsl(var(--color-text-muted))] line-through"
                  : "text-[hsl(var(--color-text))]"
              }`}
            >
              {patient?.fullName ?? "Patient"}
            </p>
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] truncate flex items-center gap-1.5 mt-1">
              <LuClock className="text-[12px] text-[hsl(var(--color-primary))]" />
              {timeLabel}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
