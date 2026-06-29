"use client";

import Link from "next/link";
import { LuClock, LuPhone, LuMapPin, LuCreditCard, LuX, LuBuilding2 } from "react-icons/lu";
import type { Appointment } from "@/services/appointmentService";
import { getDisplayStatus } from "@/services/appointmentService";
import { initialsOf, isoTo12Hour } from "@/components/appointments/format";
import StatusBadge from "@/components/appointments/StatusBadge";
import { useTranslations } from "next-intl";

export default function PatientApptCard({
  appt, onCancelClick, onPayClick,
}: {
  appt: Appointment;
  onCancelClick: (a: Appointment) => void;
  onPayClick: (a: Appointment) => void;
}) {
  const t = useTranslations("appointments.PatientApptCard");
  const doctor = typeof appt.doctorId === "object" ? (appt.doctorId as any) : null;
  // ── CHANGED: استخرجنا clinicId ────────────────────────────────────────────
  const clinic = typeof appt.clinicId === "object" ? (appt.clinicId as any) : null;

  const status = getDisplayStatus(appt);
  const timeLabel = isoTo12Hour(appt.startDateTime) + (appt.endDateTime ? " – " + isoTo12Hour(appt.endDateTime) : "");
  const dateObj = new Date(appt.appointmentDate);

  const docName = doctor?.fullName || doctor?.userId?.fullName;
  const docPhone = doctor?.phoneNumber || doctor?.userId?.phoneNumber;
  const docPic = doctor?.profilepicture?.secure_url || doctor?.userId?.profilepicture?.secure_url;

  // ── CHANGED: بيانات العيادة بدل عنوان الدكتور ────────────────────────────
  const clinicName    = clinic?.name;
  const clinicAddress = clinic ? `${clinic.address}${clinic.governorate ? " — " + clinic.governorate : ""}` : null;
  const clinicPhone   = clinic?.phone || clinic?.whatsapp;

  return (
    <div className="group relative flex bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden mb-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer">
      {/* Date stub */}
      <div className={`w-[75px] sm:w-[110px] shrink-0 flex flex-col items-center justify-center gap-1 py-4 border-e-2 border-dashed border-[hsl(var(--color-border))] relative z-10 ${
        status === "upcoming" ? "bg-[hsl(var(--color-warning-bg))]"
        : status === "completed" ? "bg-[hsl(var(--color-success-bg))]"
        : "bg-[hsl(var(--color-danger-bg))]"
      }`}>
        <span className="text-[12px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))]">
          {dateObj.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className={`text-[28px] font-black leading-none tracking-tighter ${status === "cancelled" ? "line-through text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-text))]"}`}>
          {dateObj.getDate()}
        </span>
        <span className="text-[13px] font-bold mt-1 text-[hsl(var(--color-text-muted))]">
          {isoTo12Hour(appt.startDateTime)}
        </span>
        <span className="absolute -end-[10px] -top-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))]" />
        <span className="absolute -end-[10px] -bottom-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))]" />
      </div>

      {/* Body */}
      <div className="flex-1 p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link href={doctor?._id ? `/patient/doctors/${doctor._id}` : "#"} className="shrink-0 hover:opacity-80 transition-opacity">
            {docPic ? (
              <img src={docPic} alt={docName || t("doctor")} className="w-12 h-12 rounded-xl object-cover border border-[hsl(var(--color-border))]" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-primary))] text-[14px] font-black">
                {initialsOf(docName || t("doctor"))}
              </div>
            )}
          </Link>

          <div className="min-w-0 flex flex-col justify-center">
            <Link href={doctor?._id ? `/patient/doctors/${doctor._id}` : "#"} className="hover:underline decoration-primary underline-offset-2">
              <p className={`text-[15px] font-black truncate ${status === "cancelled" ? "line-through text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-text))]"}`}>
                {docName ? t("dr", { name: docName }) : t("doctor")}
              </p>
            </Link>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                <LuClock className="text-[12px] text-primary" /> {timeLabel}
              </p>

              {/* ── CHANGED: بيانات العيادة ───────────────────────────────── */}
              {clinicName && (
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <LuBuilding2 className="text-[11px] text-primary" /> {clinicName}
                </p>
              )}
              {clinicAddress && (
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 max-w-[180px] truncate">
                  <LuMapPin className="text-[11px] shrink-0" /> {clinicAddress}
                </p>
              )}
              {clinicPhone && (
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <LuPhone className="text-[11px]" /> {clinicPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <StatusBadge status={status} />
          {status === "upcoming" && (
            <>
              <button
                onClick={() => onPayClick(appt)}
                className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-lg bg-[hsl(var(--color-primary))] text-white hover:-translate-y-[1px] cursor-pointer transition-all"
              >
                <LuCreditCard className="text-[14px]" /> {t("pay")}
              </button>
              <button
                onClick={() => onCancelClick(appt)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--color-text-muted))] cursor-pointer hover:bg-[hsl(var(--color-danger-bg))] hover:text-[hsl(var(--color-danger))] transition-colors"
              >
                <LuX className="text-[14px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
