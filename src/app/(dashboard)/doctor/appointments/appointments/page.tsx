"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuClock,
  LuStethoscope,
} from "react-icons/lu";

import {
  Appointment,
  completeAppointment,
  getDisplayStatus,
  getDoctorAppointments,
} from "@/services/appointmentService";
import { dayLabel, initialsOf, isoTo12Hour } from "@/components/appointments/format";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import StatusBadge from "@/components/appointments/StatusBadge";
import EmptyState from "@/components/appointments/EmptyState";
import SectionToggle from "@/components/appointments/SectionToggle";

type Tab = "today" | "upcoming" | "completed" | "cancelled";

// ─── Today's patient card ──────────────────────────────────────────────────────
function TodayCard({
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
    <div className="group bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] border-l-[3px] border-l-primary rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200">
      {/* Avatar */}
      <div className="relative w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-white text-[13px] font-black shrink-0 ring-2 ring-[hsl(var(--color-bg-surface))] shadow-sm">
        {initialsOf(patient?.fullName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[hsl(var(--color-text))] truncate">
          {patient?.fullName ?? "Patient"}
        </p>
        <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
          <LuClock className="text-[11px]" />
          {timeLabel}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <StatusBadge status={status} />
        {status === "upcoming" && (
          <button
            onClick={() => onComplete(appt._id)}
            disabled={completing}
            className="flex items-center gap-1.5 text-[11.5px] font-bold px-3.5 py-1.5 rounded-lg bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] hover:bg-[hsl(var(--color-success))] hover:text-white disabled:opacity-50 transition-colors duration-150"
          >
            <LuCheck className="text-[12px]" />
            Done
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Regular appointment row ───────────────────────────────────────────────────
function ApptRow({ appt }: { appt: Appointment }) {
  const patient = typeof appt.patientId === "object" ? appt.patientId : null;
  const status = getDisplayStatus(appt);
  const dimmed = status === "cancelled";
  const timeLabel =
    isoTo12Hour(appt.startDateTime) +
    (appt.endDateTime ? " – " + isoTo12Hour(appt.endDateTime) : "");

  return (
    <div
      className={`group relative flex bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden mb-3 transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      {/* Date stub */}
      <div
        className={`w-[88px] sm:w-[100px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-3 border-r-2 border-dashed border-[hsl(var(--color-border-soft))] ${
          dimmed
            ? "bg-[hsl(var(--color-bg-soft))]"
            : "bg-[hsl(var(--color-primary)/0.07)]"
        }`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-primary"
          }`}
        >
          {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span
          className={`text-[27px] font-black leading-none ${
            dimmed
              ? "text-[hsl(var(--color-text-muted))]"
              : "text-[hsl(var(--color-text))]"
          }`}
        >
          {new Date(appt.appointmentDate).getDate()}
        </span>
        <span
          className={`text-[10px] font-bold mt-0.5 ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-primary"
          }`}
        >
          {isoTo12Hour(appt.startDateTime)}
        </span>
        {/* Punch holes */}
        <span className="absolute -right-[10px] -top-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] shadow-inner" />
        <span className="absolute -right-[10px] -bottom-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] shadow-inner" />
      </div>

      {/* Body */}
      <div className="flex-1 p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-[hsl(var(--color-bg-surface))] to-transparent">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-white text-[14px] font-black shrink-0 shadow-sm">
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
              <LuClock className="text-[11px] text-primary" />
              {timeLabel}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

// ─── Tab pill ───────────────────────────────────────────────────────────────────
function ApptTab({
  label,
  value,
  active,
  count,
  onClick,
}: {
  label: string;
  value: Tab;
  active: Tab;
  count: number;
  onClick: () => void;
}) {
  const isActive = value === active;
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 sm:flex-none min-w-[110px] sm:min-w-0 px-2 sm:px-5 py-2.5 rounded-xl text-[11.5px] sm:text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
        isActive
          ? "bg-[hsl(var(--color-primary)/0.1)] text-primary shadow-sm"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))]"
      }`}
    >
      {label}
      <span
        className={`text-[10px] font-black min-w-[22px] px-1.5 py-0.5 rounded-full transition-colors ${
          isActive
            ? "bg-primary text-white shadow-[0_2px_8px_hsl(var(--color-primary)/0.4)]"
            : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  const [toast, setToast] = useState<{
    msg: string;
    variant: "success" | "error";
  } | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("today");
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDoctorAppointments();
setAppointments(data as any);
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load appointments", variant: "error" });
      } finally {
        setApptLoading(false);
      }
    })();
  }, []);

  // Group appointments
  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: Record<Tab, Appointment[]> = {
      today: [],
      upcoming: [],
      completed: [],
      cancelled: [],
    };

    appointments.forEach((a) => {
      const status = getDisplayStatus(a);
      const apptDate = new Date(a.appointmentDate);
      apptDate.setHours(0, 0, 0, 0);

      if (status === "cancelled") {
        result.cancelled.push(a);
      } else if (status === "completed") {
        result.completed.push(a);
      } else if (apptDate.getTime() === today.getTime()) {
        result.today.push(a);
      } else {
        result.upcoming.push(a);
      }
    });

    result.today.sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
    result.upcoming.sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );
    result.completed.sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    );

    return result;
  }, [appointments]);

  // Group upcoming by day
  const upcomingByDay = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: number; items: Appointment[] }>();
    grouped.upcoming.forEach((a) => {
      const key = new Date(a.appointmentDate).toDateString();
      if (!map.has(key)) {
        map.set(key, {
          label: dayLabel(a.appointmentDate),
          sortKey: new Date(a.appointmentDate).getTime(),
          items: [],
        });
      }
      map.get(key)!.items.push(a);
    });
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [grouped.upcoming]);

  async function handleComplete(appointmentId: string) {
    setCompleting(appointmentId);
    try {
      await completeAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: "completed" } : a
        )
      );
      setToast({ msg: "Appointment marked as completed", variant: "success" });
    } catch (err: any) {
      setToast({ msg: err.message || "Could not complete appointment", variant: "error" });
    } finally {
      setCompleting(null);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow-[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-gradient-to-br from-[hsl(var(--color-primary)/0.15)] to-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.1)] text-primary items-center justify-center text-[20px] shrink-0 shadow-inner">
            <LuCalendarDays />
          </div>
          <div>
            <h1 className="text-[18px] md:text-[22px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              Appointments
            </h1>
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Your patient visits, today and beyond
            </p>
          </div>
        </div>
        <SectionToggle />
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Tab bar */}
        <div className="mb-6 w-full flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[hsl(var(--color-bg-soft))] p-1.5 rounded-[14px] border border-[hsl(var(--color-border))] w-full lg:w-auto">
            <ApptTab label="Today" value="today" active={tab} count={grouped.today.length} onClick={() => setTab("today")} />
            <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => setTab("upcoming")} />
            <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} onClick={() => setTab("completed")} />
            <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => setTab("cancelled")} />
          </div>
        </div>

        {apptLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[80px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
            ))}
          </div>
        ) : tab === "today" ? (
          grouped.today.length === 0 ? (
            <EmptyState
              icon={<LuStethoscope />}
              title="No patients today"
              description="Your schedule is clear for today. Enjoy the break!"
            />
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-3">
                {grouped.today.length} patient{grouped.today.length !== 1 ? "s" : ""} today
              </p>
              {grouped.today.map((appt) => (
                <TodayCard
                  key={appt._id}
                  appt={appt}
                  onComplete={handleComplete}
                  completing={completing === appt._id}
                />
              ))}
            </div>
          )
        ) : tab === "upcoming" ? (
          grouped.upcoming.length === 0 ? (
            <EmptyState
              icon={<LuCalendarDays />}
              title="No upcoming appointments"
              description="Patients will appear here once they book a slot."
            />
          ) : (
            upcomingByDay.map((group) => (
              <div key={group.label + group.sortKey} className="mb-6">
                <div className="flex items-baseline gap-2.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <h4 className="text-[14px] font-black text-[hsl(var(--color-text))]">
                    {group.label}
                  </h4>
                  <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                    {group.items.length} patient{group.items.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
                </div>
                {group.items.map((appt) => (
                  <ApptRow key={appt._id} appt={appt} />
                ))}
              </div>
            ))
          )
        ) : grouped[tab].length === 0 ? (
          <EmptyState
            icon={<LuCalendarDays />}
            title={`No ${tab} appointments`}
            description="Nothing to show in this tab yet."
          />
        ) : (
          <div>
            {grouped[tab].map((appt) => (
              <ApptRow key={appt._id} appt={appt} />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <AppointmentToast
          message={toast.msg}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
