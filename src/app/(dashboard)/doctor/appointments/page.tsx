"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { user, token, role } = useAuth();
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
        setClinics(data.clinics || []);
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

  async function handleStartSession(appointment: Appointment) {
    setCompleting(appointment._id);
    try {
      const patientId = typeof appointment.patientId === "string" ? appointment.patientId : appointment.patientId._id;
      const clinicId = typeof appointment.clinicId === "string" ? appointment.clinicId : appointment.clinicId?._id;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      
      await axios.post(
        `${baseUrl}/doctor/session/request`,
        { patientId, clinicId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setToast({ msg: "Session requested successfully!", variant: "success" });
      router.push("/doctor");
    } catch (err: any) {
      setToast({ msg: err.response?.data?.message || err.message || "Could not start session", variant: "error" });
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
        showBack={true}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 lg:gap-8">

        {/* ══════════════════════════════════════════════════════
            MAIN AREA
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Header Controls: Tabs & Clinics Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Tab bar (Segmented Control Style) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1.5 rounded-[16px] w-full md:w-auto">
              <ApptTab label="Today" value="today" active={tab} count={grouped.today.length} onClick={() => setTab("today")} />
              <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => setTab("upcoming")} />
              <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} onClick={() => setTab("completed")} />
              <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => setTab("cancelled")} />
            </div>

            {/* Clinics Dropdown */}
            {role !== 'assistant' && (
              <div className="relative shrink-0 w-full md:w-auto">
                <select
                  value={selectedClinicId || ""}
                  onChange={(e) => setSelectedClinicId(e.target.value || null)}
                  className="appearance-none bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.5)] text-[hsl(var(--color-text))] px-4 py-2.5 pr-10 rounded-[12px] text-[13px] font-bold outline-none cursor-pointer w-full md:w-[250px] shadow-sm transition-colors"
                >
                  <option value="">All Clinics</option>
                  {clinics.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[hsl(var(--color-text-muted))]">
                  <LuChevronDown className="text-base" />
                </div>
              </div>
            )}
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
                      onStart={handleStartSession}
                      starting={completing === appt._id}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {group.items.map((appt) => (
                        <ApptRow key={appt._id} appt={appt} />
                      ))}
                    </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
