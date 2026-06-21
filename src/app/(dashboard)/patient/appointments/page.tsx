"use client";

import { useEffect, useMemo, useState } from "react";
import { LuCalendarDays, LuClock, LuStethoscope, LuX, LuCreditCard, LuCheck, LuPhone, LuMapPin } from "react-icons/lu";
import Link from "next/link";

import {
  Appointment, cancelAppointment, getDisplayStatus, getMyAppointments,
} from "@/services/appointmentService";
import { dayLabel, initialsOf, isoTo12Hour } from "@/components/appointments/format";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import CancelModal from "@/components/appointments/CancelModal";

type Tab = "upcoming" | "completed" | "cancelled";
type DisplayStatus = "upcoming" | "completed" | "cancelled";

// ─── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<DisplayStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  upcoming: {
    label: "Upcoming",
    bg: "bg-sky-50",
    text: "text-sky-600",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-400",
    border: "border-red-200",
  },
};

// ─── Pay modal (temporary) ──────────────────────────────────────────────────────
function PayModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [paid, setPaid] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-sky-400 px-6 py-5 text-white text-center">
          <LuCreditCard className="text-[32px] mx-auto mb-2" />
          <p className="text-[16px] font-black">Pay for Appointment</p>
          <p className="text-[11px] opacity-80 mt-1">Secure payment — temporary placeholder</p>
        </div>
        <div className="p-6 space-y-4">
          {paid ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <LuCheck className="text-emerald-500 text-[28px]" />
              </div>
              <p className="text-[15px] font-black text-[hsl(var(--color-text))]">Payment successful!</p>
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-1">This is a placeholder — no real charge was made.</p>
            </div>
          ) : (
            <>
              <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-4 border border-[hsl(var(--color-border))]">
                <div className="flex justify-between text-[13px] font-semibold text-[hsl(var(--color-text-muted))] mb-1">
                  <span>Consultation fee</span><span className="text-[hsl(var(--color-text))] font-black">EGP 350</span>
                </div>
                <div className="flex justify-between text-[11px] text-[hsl(var(--color-text-muted))]">
                  <span>Platform fee</span><span>EGP 20</span>
                </div>
                <div className="border-t border-[hsl(var(--color-border))] mt-3 pt-3 flex justify-between text-[14px] font-black text-[hsl(var(--color-text))]">
                  <span>Total</span><span className="text-primary">EGP 370</span>
                </div>
              </div>
              <button onClick={() => setPaid(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-sky-400 text-white text-[14px] font-black shadow-[0_4px_15px_hsl(var(--color-primary)/0.35)] hover:scale-[1.01] transition-all">
                Pay Now
              </button>
            </>
          )}
          <button onClick={() => { setPaid(false); onClose(); }}
            className="w-full py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
            {paid ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DisplayStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Appointment Card ───────────────────────────────────────────────────────────
function ApptCard({
  appt, onCancelClick, onPayClick,
}: {
  appt: Appointment;
  onCancelClick: (a: Appointment) => void;
  onPayClick: (a: Appointment) => void;
}) {
  const doctor = typeof appt.doctorId === "object" ? (appt.doctorId as any) : null;
  const status = getDisplayStatus(appt);
  const cfg = STATUS_CONFIG[status];
  const timeLabel = isoTo12Hour(appt.startDateTime) + (appt.endDateTime ? " – " + isoTo12Hour(appt.endDateTime) : "");
  const dateObj = new Date(appt.appointmentDate);

  const docName = doctor?.fullName || doctor?.userId?.fullName || doctor?.user?.fullName;
  const docPhone = doctor?.phoneNumber || doctor?.userId?.phoneNumber || doctor?.phone;
  const docAddress = doctor?.clinicAddress || doctor?.address || doctor?.clinicInfo?.address;
  const docPic = doctor?.profilepicture?.secure_url || doctor?.userId?.profilepicture?.secure_url;

  return (
    <div className={`group relative flex bg-[hsl(var(--color-bg-surface))] border rounded-2xl shadow-sm overflow-hidden mb-3 transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] ${cfg.border} border-l-4`}
      style={{ borderLeftColor: status === "upcoming" ? "hsl(var(--color-primary))" : status === "completed" ? "#10b981" : "#f87171" }}>

      {/* Date stub */}
      <div className={`w-[90px] sm:w-[100px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-4 border-r border-dashed border-[hsl(var(--color-border))] ${
        status === "cancelled" ? "opacity-50" : ""
      }`} style={{ background: status === "upcoming" ? "hsl(var(--color-primary)/0.06)" : status === "completed" ? "rgb(16 185 129 / 0.06)" : "rgb(248 113 113 / 0.06)" }}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))]">
          {dateObj.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className={`text-[28px] font-black leading-none ${status === "cancelled" ? "line-through text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-text))]"}`}>
          {dateObj.getDate()}
        </span>
        <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))]">
          {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link href={doctor?._id ? `/patient/doctors/${doctor._id}` : "#"} className="shrink-0 hover:opacity-80 transition-opacity">
            {docPic ? (
              <img src={docPic} alt={docName || "Doctor"} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-[hsl(var(--color-border))]" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center text-white text-[14px] font-black shadow-sm">
                {initialsOf(docName || "Doctor")}
              </div>
            )}
          </Link>
          <div className="min-w-0 flex flex-col justify-center">
            <Link href={doctor?._id ? `/patient/doctors/${doctor._id}` : "#"} className="hover:underline decoration-primary underline-offset-2">
              <p className={`text-[15px] font-black truncate ${status === "cancelled" ? "line-through text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-text))]"}`}>
                {docName ? `Dr. ${docName}` : "Doctor"}
              </p>
            </Link>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                <LuClock className="text-[12px] text-primary" />{timeLabel}
              </p>
              {docPhone && (
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
                  <LuPhone className="text-[11px]" />{docPhone}
                </p>
              )}
              {docAddress && (
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 max-w-[150px] sm:max-w-[200px] truncate">
                  <LuMapPin className="text-[11px]" />{docAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <StatusBadge status={status} />
          {status === "upcoming" && (
            <>
              <button onClick={() => onPayClick(appt)}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-primary text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all">
                <LuCreditCard className="text-[12px]" />Pay
              </button>
              <button onClick={() => onCancelClick(appt)} title="Cancel"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-red-50 hover:text-red-500 transition-colors">
                <LuX className="text-[14px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab button ──────────────────────────────────────────────────────────────────
function ApptTab({ label, value, active, count, color, onClick }: {
  label: string; value: Tab; active: Tab; count: number;
  color: string; onClick: () => void;
}) {
  const isActive = value === active;
  return (
    <button onClick={onClick}
      className={`relative flex-1 sm:flex-none min-w-[110px] sm:min-w-0 px-2 sm:px-5 py-2.5 rounded-xl text-[11.5px] sm:text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
        isActive 
          ? "bg-[hsl(var(--color-bg-surface))] shadow-sm ring-1 ring-[hsl(var(--color-border))]" 
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))/0.5]"
      }`}>
      <span className={isActive ? "text-[hsl(var(--color-text))]" : ""}>{label}</span>
      <span className={`text-[10.5px] font-bold min-w-[20px] px-1.5 py-0.5 rounded-full ${isActive ? color : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"}`}>
        {count}
      </span>
    </button>
  );
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
    const result: Record<Tab, Appointment[]> = { upcoming: [], completed: [], cancelled: [] };
    appointments.forEach((a) => result[getDisplayStatus(a)].push(a));
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
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow-[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-gradient-to-br from-[hsl(var(--color-primary)/0.15)] to-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.1)] text-primary items-center justify-center text-[20px] shrink-0 shadow-inner">
            <LuCalendarDays />
          </div>
          <div>
            <h1 className="text-[18px] md:text-[22px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              My Appointments
            </h1>
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Track your upcoming and past visits
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="w-full lg:w-auto flex flex-wrap items-center justify-center p-1.5 bg-[hsl(var(--color-bg-soft))] rounded-[16px] border border-[hsl(var(--color-border))] shadow-inner">
            <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} color="bg-sky-100 text-sky-600" onClick={() => setTab("upcoming")} />
            <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} color="bg-emerald-100 text-emerald-600" onClick={() => setTab("completed")} />
            <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} color="bg-red-100 text-red-500" onClick={() => setTab("cancelled")} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-[88px] rounded-2xl bg-[hsl(var(--color-border-soft))] animate-pulse" />)}</div>
        ) : tab === "upcoming" ? (
          grouped.upcoming.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-4 text-[26px] text-sky-400"><LuStethoscope /></div>
              <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1">No upcoming appointments</h3>
              <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">When you book a visit, it'll show up here.</p>
            </div>
          ) : upcomingByDay.map((group) => (
            <div key={group.sortKey} className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <h4 className="text-[14px] font-black text-[hsl(var(--color-text))]">{group.label}</h4>
                <span className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{group.items.length} visit{group.items.length !== 1 ? "s" : ""}</span>
                <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
              </div>
              {group.items.map((appt) => <ApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}
            </div>
          ))
        ) : grouped[tab].length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] flex items-center justify-center mx-auto mb-4 text-[26px] text-[hsl(var(--color-text-muted))]"><LuCalendarDays /></div>
            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1">No {tab} appointments</h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">Nothing to show here yet.</p>
          </div>
        ) : (
          <div>{grouped[tab].map((appt) => <ApptCard key={appt._id} appt={appt} onCancelClick={setCancelTarget} onPayClick={setPayTarget} />)}</div>
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
