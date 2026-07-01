"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuBuilding2,
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
import DashboardHeader from "@/components/global/DashboardHeader";
import Pagination from "@/components/ui/Pagination";

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
import { getMyClinics, Clinic } from "@/services/clinicService";
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

import SectionToggle from "@/components/appointments/SectionToggle";

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  const { user, role } = useAuth();
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

  const [paginationInfo, setPaginationInfo] = useState<any>(null);
  const [page, setPage] = useState(1);

  // ── Clinics sidebar filter ───────────────────────────────────
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(role === 'assistant' ? (user?.clinicId || null) : null); // null = All Clinics

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyClinics();
        setClinics(data);
      } catch {
        // sidebar fails silently — appointments still load below
      } finally {
        setClinicsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setApptLoading(true);
      try {
        const response = await getDoctorAppointments({ page, limit: 10 });
        setAppointments(response.data);
        setPaginationInfo(response.pagination);
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load appointments", variant: "error" });
      } finally {
        setApptLoading(false);
      }
    })();
  }, [page]);

  // Appointments filtered to the selected clinic (or all, if none selected)
  const filteredAppointments = useMemo(() => {
    if (!selectedClinicId) return appointments;
    return appointments.filter((a) => {
      const cid =
        typeof a.clinicId === "string" ? a.clinicId : a.clinicId?._id;
      return cid === selectedClinicId;
    });
  }, [appointments, selectedClinicId]);

  // Count appointments per clinic, for the sidebar badges
  const countByClinic = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach((a) => {
      const cid = typeof a.clinicId === "string" ? a.clinicId : a.clinicId?._id;
      if (!cid) return;
      map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [appointments]);

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

    filteredAppointments.forEach((a) => {
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
  }, [filteredAppointments]);

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
      <DashboardHeader
        title="Appointments"
        subtitle="Manage your schedule and patient visits"
        backPath="/doctor"
        rightElement={<SectionToggle />}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">

        {/* ══════════════════════════════════════════════════════
            LEFT — Clinics sidebar (Hidden for Assistants)
        ══════════════════════════════════════════════════════ */}
        {role !== 'assistant' && (
        <aside className="w-full lg:w-60 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 px-1">
            Clinics
          </p>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto scrollbar-hide lg:overflow-visible pb-1">
            <button
              onClick={() => setSelectedClinicId(null)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-[13px] font-bold border transition-all shrink-0 cursor-pointer ${
                selectedClinicId === null
                  ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)]"
                  : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))]"
              }`}
            >
              <LuUsers className="text-[15px] shrink-0" />
              <span className="flex-1 text-left">All Clinics</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  selectedClinicId === null
                    ? "bg-white/20"
                    : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"
                }`}
              >
                {appointments.length}
              </span>
            </button>

            {clinicsLoading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse shrink-0 lg:w-full w-40"
                />
              ))
            ) : (
              clinics.map((clinic) => (
                <button
                  key={clinic._id}
                  onClick={() => setSelectedClinicId(clinic._id)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-[13px] font-bold border transition-all shrink-0 cursor-pointer ${
                    selectedClinicId === clinic._id
                      ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)]"
                      : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))]"
                  }`}
                >
                  <LuBuilding2 className="text-[15px] shrink-0" />
                  <span className="flex-1 text-left truncate">{clinic.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      selectedClinicId === clinic._id
                        ? "bg-white/20"
                        : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"
                    }`}
                  >
                    {countByClinic[clinic._id] || 0}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
        )}

        {/* ══════════════════════════════════════════════════════
            RIGHT — APPOINTMENTS for the selected clinic
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0">
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
            
            {!apptLoading && paginationInfo && paginationInfo.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={paginationInfo.currentPage}
                  totalPages={paginationInfo.totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
          </div>
        </div>
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
