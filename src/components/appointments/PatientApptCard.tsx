"use client";

import Link from "next/link";
import { LuClock, LuPhone, LuMapPin, LuCreditCard, LuX, LuBuilding2, LuCalendarDays } from "react-icons/lu";
import type { Appointment } from "@/services/appointmentService";
import { getDisplayStatus } from "@/services/appointmentService";
import { initialsOf, isoTo12Hour } from "@/components/appointments/format";
import StatusBadge from "@/components/appointments/StatusBadge";

export default function PatientApptCard({
  appt, onCancelClick, onPayClick,
}: {
  appt: Appointment;
  onCancelClick: (a: Appointment) => void;
  onPayClick: (a: Appointment) => void;
}) {
  const doctor = typeof appt.doctorId === "object" ? (appt.doctorId as any) : null;
  // ── CHANGED: استخرجنا clinicId ────────────────────────────────────────────
  const clinic = typeof appt.clinicId === "object" ? (appt.clinicId as any) : null;

  const isFollowUpAction = (appt as any).isFollowUpAction;
  const status = isFollowUpAction ? "upcoming" : getDisplayStatus(appt);
  const timeLabel = isFollowUpAction 
    ? "Pending Time Selection" 
    : isoTo12Hour(appt.startDateTime) + (appt.endDateTime ? " – " + isoTo12Hour(appt.endDateTime) : "");
  const dateObj = new Date(appt.appointmentDate);

  const docName = doctor?.fullName || doctor?.userId?.fullName;
  const docPhone = doctor?.phoneNumber || doctor?.userId?.phoneNumber;
  const docPic = doctor?.profilepicture?.secure_url || doctor?.userId?.profilepicture?.secure_url;

  // ── CHANGED: بيانات العيادة بدل عنوان الدكتور ────────────────────────────
  const clinicName    = clinic?.name;
  const clinicAddress = clinic ? `${clinic.address}${clinic.governorate ? " — " + clinic.governorate : ""}` : null;
  const clinicPhone   = clinic?.phone || clinic?.whatsapp;

  return (
    <div className={`group relative bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px cursor-pointer overflow-hidden ${
      status === "cancelled" ? "opacity-60 saturate-50 hover:opacity-100" : ""
    }`}>
      <div className={`absolute top-0 bottom-0 left-0 w-[4px] rounded-l-2xl ${
        status === "upcoming" ? "bg-[hsl(var(--color-warning))]" : status === "completed" ? "bg-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-danger))]"
      }`} />

      <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
        <Link href={doctor?._id ? `/patient/doctors/${doctor._id}` : "#"} className="shrink-0 hover:opacity-80 transition-opacity mt-1 sm:mt-0">
          {docPic ? (
            <img src={docPic} alt={docName || "Doctor"} className="w-12 h-12 rounded-full object-cover border border-[hsl(var(--color-border))]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] border border-[hsl(var(--color-primary)/0.2)] flex items-center justify-center text-sm font-bold tracking-tight shrink-0">
              {initialsOf(docName || "Doctor")}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={doctor?._id ? `/patient/doctors/${doctor._id}` : "#"} className="hover:underline decoration-[hsl(var(--color-primary))] underline-offset-2">
            <p className={`text-base font-bold tracking-tight truncate ${status === "cancelled" ? "text-[hsl(var(--color-text-muted))] line-through" : "text-[hsl(var(--color-text))]"}`}>
              {docName ? `Dr. ${docName}` : "Doctor"}
            </p>
          </Link>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5 shrink-0">
              <LuCalendarDays className="text-[12px] shrink-0" />
              <span className="truncate">{dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </p>
            <p className="text-[12px] font-bold text-[hsl(var(--color-primary))] flex items-center gap-1.5 shrink-0">
              <LuClock className="text-[12px] shrink-0" />
              <span className="truncate">{isFollowUpAction ? "Pending Time Selection" : timeLabel}</span>
            </p>
          </div>
          
          {(clinicName || clinicAddress || clinicPhone) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 opacity-80">
              {clinicName && (
                <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <LuBuilding2 className="text-[11px]" /> {clinicName}
                </p>
              )}
              {clinicAddress && (
                <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 max-w-[150px] sm:max-w-[180px] truncate">
                  <LuMapPin className="text-[11px] shrink-0" /> {clinicAddress}
                </p>
              )}
              {clinicPhone && (
                <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <LuPhone className="text-[11px]" /> {clinicPhone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0 pl-14 sm:pl-0">
        {(appt as any).isFollowUp && !isFollowUpAction && (
          <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-[hsl(var(--color-primary-bg))] text-[hsl(var(--color-primary))] rounded flex items-center gap-1">
            Follow-Up
          </span>
        )}
        {isFollowUpAction && (
          <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] rounded flex items-center gap-1">
            Follow-Up Needed
          </span>
        )}
        <StatusBadge status={status} />
        {status === "upcoming" && !isFollowUpAction && appt.paymentStatus === "pending" && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); onPayClick(appt); }}
              className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight px-3 py-1.5 rounded-lg bg-[hsl(var(--color-primary))] text-white hover:opacity-90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px cursor-pointer transition-all"
            >
              <LuCreditCard className="text-[14px]" /> Pay
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onCancelClick(appt); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] cursor-pointer hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))] transition-colors"
            >
              <LuX className="text-[14px]" />
            </button>
          </>
        )}
        {isFollowUpAction && (
          <Link
            href={doctor?._id ? `/patient/doctors/${doctor._id}/book?clinicId=${clinic?._id || ""}` : "#"}
            className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight px-3 py-1.5 rounded-lg bg-[hsl(var(--color-primary))] text-white hover:opacity-90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px cursor-pointer transition-all"
          >
            <LuCalendarDays className="text-[14px]" /> Book Now
          </Link>
        )}
      </div>
    </div>
  );
}
