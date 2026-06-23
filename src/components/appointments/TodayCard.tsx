"use client";

import { LuClock, LuCheck } from "react-icons/lu";
import { Appointment, getDisplayStatus } from "@/services/appointmentService";
import { initialsOf, isoTo12Hour } from "@/components/appointments/format";
import StatusBadge from "@/components/appointments/StatusBadge";
import { Button } from "@/components/ui/Button";

export default function TodayCard({
  appt,
  onComplete,
  completing,
}: {
  appt: Appointment;
  onComplete: (id: string) => void;
  completing: boolean;
}) {
  const patient = typeof appt.patientId === "object" ? appt.patientId : null;
  const status = getDisplayStatus(appt);
  const timeLabel =
    isoTo12Hour(appt.startDateTime) +
    (appt.endDateTime ? " – " + isoTo12Hour(appt.endDateTime) : "");

  return (
    <div className="group relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
      <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[hsl(var(--color-secondary))] rounded-l-2xl" />
      {/* Avatar */}
      <div className="relative w-12 h-12 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] flex items-center justify-center text-[14px] font-black shrink-0">
        {initialsOf(patient?.fullName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-black text-[hsl(var(--color-text))] truncate">
          {patient?.fullName ?? "Patient"}
        </p>
        <p className="text-[12px] font-bold text-[hsl(var(--color-primary))] flex items-center gap-1.5 mt-1">
          <LuClock className="text-[12px]" />
          {timeLabel}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={status} />
        {status === "upcoming" && (
          <Button
            onClick={() => onComplete(appt._id)}
            isLoading={completing}
            icon={LuCheck}
            className="!text-[12px] !px-4 !py-1.5 !h-[34px] !rounded-lg !bg-[hsl(var(--color-success-bg))] !text-[hsl(var(--color-success))] hover:!bg-[hsl(var(--color-success))]"
          >
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
