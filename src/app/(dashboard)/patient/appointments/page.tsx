"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuCalendarDays,
  LuStethoscope,
  LuBuilding2,
  LuUsers,
} from "react-icons/lu";

import {
  Appointment,
  cancelAppointment,
  getDisplayStatus,
  getMyAppointments,
} from "@/services/appointmentService";
import { dayLabel, isoTo12Hour } from "@/components/appointments/format";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import CancelModal from "@/components/appointments/CancelModal";
import EmptyState from "@/components/appointments/EmptyState";
import ApptTab, { TabType as Tab } from "@/components/appointments/ApptTab";
import PatientApptCard from "@/components/appointments/PatientApptCard";
import PayModal from "@/components/appointments/PayModal";
import DashboardHeader from "@/components/global/DashboardHeader";
import Pagination from "@/components/ui/Pagination";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function doctorNameOf(appt: Appointment): string {
  const d = appt.doctorId as any;
  return typeof d === "string" ? "Doctor" : `Dr. ${d?.fullName ?? "Doctor"}`;
}

function groupKeyOf(appt: Appointment): string {
  const doctorIdStr = typeof appt.doctorId === "string" ? appt.doctorId : (appt.doctorId as any)?._id;
  const clinicIdStr = appt.clinicId?._id ?? "no-clinic";
  return `${doctorIdStr}__${clinicIdStr}`;
}

interface BookingGroup {
  key: string;
  doctorName: string;
  clinicName: string;
  clinicAddress?: string;
  items: Appointment[];
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function PatientAppointmentsPage() {
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payTarget, setPayTarget] = useState<Appointment | null>(null);

  const [paginationInfo, setPaginationInfo] = useState<any>(null);
  const [page, setPage] = useState(1);

  // which "Doctor + Clinic" pair is selected in the left sidebar — null = All
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await getMyAppointments({ page: 1, limit: 1000 });
        setAppointments(response.data as any);
        // We will do client-side pagination, so we ignore the backend paginationInfo
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load appointments", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  // Group ALL appointments by doctor + clinic, for the sidebar
  const bookingGroups = useMemo<BookingGroup[]>(() => {
    const map = new Map<string, BookingGroup>();
    appointments.forEach((a) => {
      const key = groupKeyOf(a);
      if (!map.has(key)) {
        map.set(key, {
          key,
          doctorName: doctorNameOf(a),
          clinicName: a.clinicId?.name ?? "Clinic",
          clinicAddress: a.clinicId?.address,
          items: [],
        });
      }
      map.get(key)!.items.push(a);
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.items[0]?.appointmentDate || 0).getTime() -
        new Date(a.items[0]?.appointmentDate || 0).getTime()
    );
  }, [appointments]);

  const selectedGroup = bookingGroups.find((g) => g.key === selectedGroupKey) ?? null;

  // Appointments scoped to the sidebar selection (or all, if "All" is selected)
  const scopedAppointments = selectedGroup ? selectedGroup.items : appointments;

  const grouped = useMemo(() => {
    const result: Record<Tab, Appointment[]> = { upcoming: [], completed: [], cancelled: [], today: [] };
    scopedAppointments.forEach((a) => {
      const myAppt = a as any;
      if (myAppt.status === "completed" && myAppt.followUpStatus === "scheduled" && myAppt.followUpStatus !== "used") {
        result.upcoming.push({
          ...a,
          isFollowUpAction: true,
          appointmentDate: myAppt.followUpDeadline,
        });
      }
      const status = getDisplayStatus(a);
      if (status === "upcoming" || status === "completed" || status === "cancelled") {
        result[status].push(a);
      }
    });
    result.upcoming.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    result.completed.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    result.cancelled.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    return result;
  }, [scopedAppointments]);

  // Client-side pagination based on the active tab
  const itemsPerPage = 10;
  const currentTabItems = grouped[tab] || [];
  const totalPages = Math.ceil(currentTabItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return currentTabItems.slice(startIndex, startIndex + itemsPerPage);
  }, [currentTabItems, page]);

  const upcomingByDay = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: number; items: Appointment[] }>();
    paginatedItems.forEach((a) => {
      const key = new Date(a.appointmentDate).toDateString();
      if (!map.has(key)) map.set(key, { label: dayLabel(a.appointmentDate), sortKey: new Date(a.appointmentDate).getTime(), items: [] });
      map.get(key)!.items.push(a);
    });
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [paginatedItems]);

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelTarget._id);
      setAppointments((prev) => prev.map((a) => a._id === cancelTarget._id ? { ...a, status: "cancelled" } : a));
      setToast({ msg: "Appointment cancelled", variant: "success" });
      setCancelTarget(null);
    } catch (err: any) {
      setToast({ msg: err.message || "Could not cancel", variant: "error" });
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title="My Appointments"
        subtitle="Track your upcoming and past visits"
        showBack={true}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        {/* ══════════════════════════════════════════════════════
            MAIN AREA
        ══════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          
          {/* Header Controls: Tabs & Clinics Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Tab bar (Segmented Control Style) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1.5 rounded-[16px] w-full md:w-auto">
              <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => { setTab("upcoming"); setPage(1); }} />
              <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} onClick={() => { setTab("completed"); setPage(1); }} />
              <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => { setTab("cancelled"); setPage(1); }} />
            </div>

            {/* Clinics Dropdown */}
            <div className="relative shrink-0 w-full md:w-auto">
              <select
                value={selectedGroupKey || ""}
                onChange={(e) => { setSelectedGroupKey(e.target.value || null); setTab("upcoming"); }}
                className="appearance-none bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.5)] text-[hsl(var(--color-text))] px-4 py-2.5 pr-10 rounded-[12px] text-[13px] font-bold outline-none cursor-pointer w-full md:w-[250px] shadow-sm transition-colors"
              >
                <option value="">All Appointments</option>
                {bookingGroups.map((group) => (
                  <option key={group.key} value={group.key}>
                    {group.doctorName} {group.clinicName && group.clinicName !== "Clinic" ? `(${group.clinicName})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[hsl(var(--color-text-muted))]">
                <LuBuilding2 className="text-base" />
              </div>
            </div>
          </div>


            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-[88px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />)}</div>
            ) : tab === "upcoming" ? (
              paginatedItems.length === 0 ? (
                <EmptyState
                  icon={<LuStethoscope />}
                  title="No upcoming appointments"
                  description="When you book a visit, it'll show up here."
                />
              ) : upcomingByDay.map((group) => (
                <div key={group.sortKey} className="mb-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-primary))] shrink-0" />
                    <h4 className="text-[14px] font-black text-[hsl(var(--color-text))]">{group.label}</h4>
                    <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{group.items.length} visit{group.items.length !== 1 ? "s" : ""}</span>
                    <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {group.items.map((appt) => <PatientApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}
                  </div>
                </div>
              ))
            ) : paginatedItems.length === 0 ? (
              <EmptyState
                icon={<LuCalendarDays />}
                title={`No ${tab} appointments`}
                description="Nothing to show here yet."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paginatedItems.map((appt) => <PatientApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
        </div>
      </main>

      <CancelModal
        open={!!cancelTarget}
        message={cancelTarget ? `Your appointment on ${dayLabel(cancelTarget.appointmentDate)} at ${isoTo12Hour(cancelTarget.startDateTime)} will be cancelled.` : ""}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
      />

      <PayModal open={!!payTarget} onClose={() => setPayTarget(null)} appointmentId={payTarget?._id} amount={payTarget?.amount} />

      {toast && <AppointmentToast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  );
}
