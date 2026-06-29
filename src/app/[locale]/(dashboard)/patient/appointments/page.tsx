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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("patient.AppointmentsPage");
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payTarget, setPayTarget] = useState<Appointment | null>(null);

  // which "Doctor + Clinic" pair is selected in the left sidebar — null = All
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAppointments();
        setAppointments(data as any);
      } catch (err: any) {
        setToast({ msg: err.message || t("failedToLoad"), variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group ALL appointments by doctor + clinic, for the sidebar
  const bookingGroups = useMemo<BookingGroup[]>(() => {
    const map = new Map<string, BookingGroup>();
    appointments.forEach((a) => {
      const key = groupKeyOf(a);
      if (!map.has(key)) {
        map.set(key, {
          key,
          doctorName: doctorNameOf(a),
          clinicName: a.clinicId?.name ?? t("clinic"),
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
      setToast({ msg: t("cancelledSuccess"), variant: "success" });
      setCancelTarget(null);
    } catch (err: any) {
      setToast({ msg: err.message || t("cancelError"), variant: "error" });
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        backPath="/patient"
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">

        {/* ══════════════════════════════════════════════════════
            LEFT — Clinics / Doctors sidebar
        ══════════════════════════════════════════════════════ */}
        <aside className="w-full lg:w-64 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 px-1">
            {t("yourClinics")}
          </p>

          {loading ? (
            <div className="flex flex-row lg:flex-col gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse shrink-0 lg:w-full w-40" />
              ))}
            </div>
          ) : bookingGroups.length === 0 ? (
            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] px-1">
              {t("noBookings")}
            </p>
          ) : (
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto scrollbar-hide lg:overflow-visible pb-1">
              <button
                onClick={() => setSelectedGroupKey(null)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-[13px] font-bold border transition-all shrink-0 cursor-pointer ${
                  selectedGroupKey === null
                    ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)]"
                    : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))]"
                }`}
              >
                <LuUsers className="text-[15px] shrink-0" />
                <span className="flex-1 text-start">{t("all")}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${selectedGroupKey === null ? "bg-white/20" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                  {appointments.length}
                </span>
              </button>

              {bookingGroups.map((group) => {
                const isActive = selectedGroupKey === group.key;
                return (
                  <button
                    key={group.key}
                    onClick={() => { setSelectedGroupKey(group.key); setTab("upcoming"); }}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all shrink-0 lg:w-full text-start cursor-pointer ${
                      isActive
                        ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)]"
                        : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))]"
                    }`}
                  >
                    <LuBuilding2 className="text-[15px] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate">{group.clinicName}</p>
                      <p className={`text-[10.5px] font-medium truncate ${isActive ? "text-white/80" : "text-[hsl(var(--color-text-muted))]"}`}>
                        {group.clinicAddress || group.doctorName}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? "bg-white/20" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                      {group.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* ══════════════════════════════════════════════════════
            RIGHT — Bookings for the selected clinic (or all)
        ══════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center mb-6">
              <div className="w-full lg:w-auto flex flex-nowrap overflow-x-auto scrollbar-hide items-center justify-start lg:justify-center p-1.5 bg-[hsl(var(--color-bg-soft))] rounded-[16px] border border-[hsl(var(--color-border))]">
                <ApptTab label={t("upcoming")} value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => setTab("upcoming")} />
                <ApptTab label={t("completed")} value="completed" active={tab} count={grouped.completed.length} onClick={() => setTab("completed")} />
                <ApptTab label={t("cancelled")} value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => setTab("cancelled")} />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-[88px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />)}</div>
            ) : tab === "upcoming" ? (
              grouped.upcoming.length === 0 ? (
                <EmptyState
                  icon={<LuStethoscope />}
                  title={t("noUpcomingTitle")}
                  description={t("noUpcomingDesc")}
                />
              ) : upcomingByDay.map((group) => (
                <div key={group.sortKey} className="mb-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-primary))] shrink-0" />
                    <h4 className="text-[14px] font-black text-[hsl(var(--color-text))]">{group.label}</h4>
                    <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{group.items.length} {group.items.length !== 1 ? t("visits") : t("visit")}</span>
                    <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
                  </div>
                  {group.items.map((appt) => <PatientApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}
                </div>
              ))
            ) : grouped[tab].length === 0 ? (
              <EmptyState
                icon={<LuCalendarDays />}
                title={t("noApptsTitle", { tab: t(tab) })}
                description={t("noApptsDesc")}
              />
            ) : (
              <div>{grouped[tab].map((appt) => <PatientApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}</div>
            )}
          </div>
        </div>
        </div>
      </main>

      <CancelModal
        open={!!cancelTarget}
        message={cancelTarget ? t("cancelConfirmMsg", { date: dayLabel(cancelTarget.appointmentDate), time: isoTo12Hour(cancelTarget.startDateTime) }) : ""}
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
      />

      <PayModal open={!!payTarget} onClose={() => setPayTarget(null)} />

      {toast && <AppointmentToast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  );
}
