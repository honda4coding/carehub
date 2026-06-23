"use client";

import { useEffect, useMemo, useState } from "react";
import { LuCalendarDays, LuStethoscope } from "react-icons/lu";

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

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function PatientAppointmentsPage() {
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payTarget, setPayTarget] = useState<Appointment | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAppointments();
        setAppointments(data as any);
      } catch (err: any) {
        setToast({ msg: err.message || "Failed to load appointments", variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const result: Record<Tab, Appointment[]> = { upcoming: [], completed: [], cancelled: [], today: [] };
    appointments.forEach((a) => {
      const status = getDisplayStatus(a);
      // Fallback for types since Patient tab has "upcoming", "completed", "cancelled".
      if (status === "upcoming" || status === "completed" || status === "cancelled") {
        result[status].push(a);
      }
    });
    result.upcoming.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    result.completed.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    result.cancelled.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    return result;
  }, [appointments]);

  const upcomingByDay = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: number; items: Appointment[] }>();
    grouped.upcoming.forEach((a) => {
      const key = new Date(a.appointmentDate).toDateString();
      if (!map.has(key)) map.set(key, { label: dayLabel(a.appointmentDate), sortKey: new Date(a.appointmentDate).getTime(), items: [] });
      map.get(key)!.items.push(a);
    });
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [grouped.upcoming]);

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
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 -[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-[hsl(var(--color-primary)/0.1)] border border-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))] items-center justify-center text-[20px] shrink-0">
            <LuCalendarDays />
          </div>
          <div>
            <h1 className="text-[18px] md:text-[22px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              My Appointments
            </h1>
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Track your upcoming and past visits
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="w-full lg:w-auto flex flex-wrap items-center justify-center p-1.5 bg-[hsl(var(--color-bg-soft))] rounded-[16px] border border-[hsl(var(--color-border))]">
            <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => setTab("upcoming")} />
            <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} onClick={() => setTab("completed")} />
            <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => setTab("cancelled")} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-[88px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />)}</div>
        ) : tab === "upcoming" ? (
          grouped.upcoming.length === 0 ? (
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
              {group.items.map((appt) => <PatientApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}
            </div>
          ))
        ) : grouped[tab].length === 0 ? (
          <EmptyState
            icon={<LuCalendarDays />}
            title={`No ${tab} appointments`}
            description="Nothing to show here yet."
          />
        ) : (
          <div>{grouped[tab].map((appt) => <PatientApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}</div>
        )}
      </main>

      <CancelModal
        open={!!cancelTarget}
        message={cancelTarget ? `Your appointment on ${dayLabel(cancelTarget.appointmentDate)} at ${isoTo12Hour(cancelTarget.startDateTime)} will be cancelled.` : ""}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
      />

      <PayModal open={!!payTarget} onClose={() => setPayTarget(null)} />

      {toast && <AppointmentToast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  );
}
