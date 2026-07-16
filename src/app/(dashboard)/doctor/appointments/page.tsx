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
  cancelAppointmentByDoctor,
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
import CancelModal from "@/components/appointments/CancelModal";
import StatusBadge from "@/components/appointments/StatusBadge";
import EmptyState from "@/components/appointments/EmptyState";
import { Button } from "@/components/ui/Button";
import TodayCard from "@/components/appointments/TodayCard";
import ApptRow from "@/components/appointments/ApptRow";
import ApptTab, { TabType as Tab } from "@/components/appointments/ApptTab";

import SectionToggle from "@/components/appointments/SectionToggle";
import { useClinicContext } from "@/context/ClinicContext";
import ClinicSelector from "@/components/doctor/ClinicSelector";

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
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [paginationInfo, setPaginationInfo] = useState<any>(null);
  const [page, setPage] = useState(1);
  const { activeClinicId } = useClinicContext();

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
        const response = await getDoctorAppointments({ page: 1, limit: 1000 });
        setAppointments(response.data);
        // We will do client-side pagination, so we ignore the backend paginationInfo
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load appointments", variant: "error" });
      } finally {
        setApptLoading(false);
      }
    })();
  }, [page, activeClinicId]);

  // Appointments filtered to the selected clinic (or all, if none selected)
  // fetchClient automatically fetches based on activeClinicId, but just in case:
  const filteredAppointments = useMemo(() => {
    if (!activeClinicId || activeClinicId === "all") return appointments;
    return appointments.filter((a) => {
      const cid =
        typeof a.clinicId === "string" ? a.clinicId : a.clinicId?._id;
      return cid === activeClinicId;
    });
  }, [appointments, activeClinicId]);

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

  // Client-side pagination based on the active tab
  const itemsPerPage = 10;
  const currentTabItems = grouped[tab] || [];
  const totalPages = Math.ceil(currentTabItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return currentTabItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentTabItems, page]);

  // Group upcoming by day using paginated items
  const upcomingByDay = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: number; items: Appointment[] }>();
    paginatedItems.forEach((a) => {
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
  }, [paginatedItems]);

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

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelAppointmentByDoctor(cancelTarget._id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === cancelTarget._id ? { ...a, status: "cancelled" } : a))
      );
      setToast({ msg: "Appointment cancelled successfully", variant: "success" });
      setCancelTarget(null);
    } catch (err: any) {
      setToast({ msg: err.message || "Could not cancel", variant: "error" });
    } finally {
      setCancelling(false);
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
              <ApptTab label="Today" value="today" active={tab} count={grouped.today.length} onClick={() => { setTab("today"); setPage(1); }} />
              <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => { setTab("upcoming"); setPage(1); }} />
              <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} onClick={() => { setTab("completed"); setPage(1); }} />
              <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => { setTab("cancelled"); setPage(1); }} />
            </div>

            {/* Clinics Dropdown */}
            {role !== 'assistant' && (
              <div className="flex items-center h-10 px-2 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] shrink-0 w-full md:w-auto">
                 <ClinicSelector />
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
              paginatedItems.length === 0 ? (
                <EmptyState
                  icon={<LuStethoscope />}
                  title="No patients today"
                  description="Your schedule is clear for today. Enjoy the break!"
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-3">
                    Showing {paginatedItems.length} patient{paginatedItems.length !== 1 ? "s" : ""} today (Total: {currentTabItems.length})
                  </p>
                  {paginatedItems.map((appt) => (
                    <TodayCard
                      key={appt._id}
                      appt={appt}
                      onStart={handleStartSession}
                      starting={completing === appt._id}
                      onCancelClick={setCancelTarget}
                    />
                  ))}
                </div>
              )

            ) : tab === "upcoming" ? (
              paginatedItems.length === 0 ? (
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
                        <ApptRow key={appt._id} appt={appt} onCancelClick={setCancelTarget} />
                      ))}
                    </div>
                  </div>
                ))
              )

            ) : (
              // Completed + Cancelled — flat list
              paginatedItems.length === 0 ? (
                <EmptyState
                  icon={<LuCalendarDays />}
                  title={`No ${tab} appointments`}
                  description="Nothing to show in this tab yet."
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paginatedItems.map((appt) => (
                    <ApptRow key={appt._id} appt={appt} />
                  ))}
                </div>
              )
            )}
            
            {!apptLoading && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
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

      <CancelModal
        open={!!cancelTarget}
        message={cancelTarget ? `Are you sure you want to cancel the appointment with ${cancelTarget.patientId && typeof cancelTarget.patientId === 'object' ? (cancelTarget.patientId as any).fullName : 'the patient'} on ${dayLabel(cancelTarget.appointmentDate)} at ${isoTo12Hour(cancelTarget.startDateTime)}? The patient will be fully refunded.` : ""}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
