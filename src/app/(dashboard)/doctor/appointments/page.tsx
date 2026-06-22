"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuClock,
  LuRefreshCw,
  LuSettings2,
  LuStethoscope,
  LuTrash2,
  LuUsers,
} from "react-icons/lu";

import { useAuth } from "@/context/AuthContext";
import {
  Appointment,
  Slot,
  completeAppointment,
  deleteSlot,
  generateSlots,
  getDoctorAppointments,
  getDisplayStatus,
  setAvailability,
} from "@/services/appointmentService";
import {
  dayLabel,
  formatFullDate,
  groupSlotsByDate,
  initialsOf,
  isoTo12Hour,
  slotTimeRangeLabel,
} from "@/components/appointments/format";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import StatusBadge from "@/components/appointments/StatusBadge";
import EmptyState from "@/components/appointments/EmptyState";
import { Button } from "@/components/ui/Button";
import TodayCard from "@/components/appointments/TodayCard";
import ApptRow from "@/components/appointments/ApptRow";
import ApptTab, { TabType as Tab } from "@/components/appointments/ApptTab";
import ScheduleSetup from "@/components/appointments/ScheduleSetup";
import GenerateSlotsCard from "@/components/appointments/GenerateSlotsCard";

import SectionToggle from "@/components/appointments/SectionToggle";

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState<{
    msg: string;
    variant: "success" | "error";
  } | null>(null);
  const [hasSelectedDays, setHasSelectedDays] = useState(false);

  const handleToast = (msg: string, variant: "success" | "error") => {
    setToast({ msg, variant });
  };

  // ── Appointments ─────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("today");
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDoctorAppointments();
        setAppointments(data);
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
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

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

    // Sort today by start time
    result.today.sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );
    // Sort upcoming ascending
    result.upcoming.sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );
    // Sort completed descending
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



  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* ── Header ── */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 -[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] items-center justify-center text-[20px] shrink-0">
            <LuCalendarDays />
          </div>
          <div>
            <h1 className="text-[18px] md:text-[22px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              Appointments
            </h1>
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Manage your schedule and patient visits
            </p>
          </div>
        </div>
        <SectionToggle />
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">

        {/* ══════════════════════════════════════════════════════
            SECTION A — APPOINTMENTS
        ══════════════════════════════════════════════════════ */}
          <>
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
                      <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-warning))] shrink-0" />
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

            ) : (
              // Completed + Cancelled — flat list
              grouped[tab].length === 0 ? (
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
              )
            )}
          </>
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
