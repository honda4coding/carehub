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
      className={`group relative flex bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden mb-3 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
        dimmed ? "opacity-60 saturate-50" : ""
      }`}
    >
      {/* Date stub */}
      <div
        className={`w-[90px] sm:w-[110px] shrink-0 flex flex-col items-center justify-center gap-1 py-4 border-r-2 border-dashed border-[hsl(var(--color-border))] relative z-10 ${
          status === "upcoming"
            ? "bg-[hsl(var(--color-warning-bg))]"
            : status === "completed"
            ? "bg-[hsl(var(--color-success-bg))]"
            : "bg-[hsl(var(--color-danger-bg))]"
        }`}
      >
        <span
          className={`text-[11px] font-black uppercase tracking-widest ${
            status === "upcoming"
              ? "text-[hsl(var(--color-warning))]"
              : status === "completed"
              ? "text-[hsl(var(--color-success))]"
              : "text-[hsl(var(--color-danger))]"
          }`}
        >
          {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-[28px] font-black leading-none tracking-tighter text-[hsl(var(--color-text))]">
          {new Date(appt.appointmentDate).getDate()}
        </span>
        <span className="text-[11px] font-bold mt-1 text-[hsl(var(--color-text-muted))]">
          {isoTo12Hour(appt.startDateTime)}
        </span>
        {/* Punch holes */}
        <span className="absolute -right-[10px] -top-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))]" />
        <span className="absolute -right-[10px] -bottom-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))]" />
      </div>

      {/* Body */}
      <div className="flex-1 p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-[hsl(var(--color-bg-surface))] to-transparent">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] flex items-center justify-center text-[14px] font-black shrink-0">
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
