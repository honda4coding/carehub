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

// ─── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
] as const;
type Day = (typeof DAYS)[number];

const DAY_LABELS: Record<Day, string> = {
  sunday: "Sun", monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat",
};

const DURATIONS = [15, 20, 30, 45, 60] as const;

type Tab = "today" | "upcoming" | "completed" | "cancelled";
type Section = "appointments" | "schedule";

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionToggle({
  active,
  onChange,
}: {
  active: Section;
  onChange: (s: Section) => void;
}) {
  return (
    <div className="inline-flex items-center bg-[hsl(var(--color-bg-surface))] p-1.5 rounded-2xl border border-[hsl(var(--color-border))] shrink-0">
      {(["appointments", "schedule"] as Section[]).map((s) => {
        const isActive = s === active;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`relative px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden ${
              isActive
                ? "text-primary "
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))]"
            }`}
          >
            {isActive && <div className="absolute inset-0 bg-[hsl(var(--color-primary)/0.1)] rounded-xl -z-10" />}
            {s === "appointments" ? (
              <LuUsers className={`text-[14px] ${isActive ? "" : "opacity-70"}`} />
            ) : (
              <LuSettings2 className={`text-[14px] ${isActive ? "" : "opacity-70"}`} />
            )}
            <span className="relative z-10">{s === "appointments" ? "Appointments" : "My Schedule"}</span>
          </button>
        );
      })}
    </div>
  );
}

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
          ? "bg-[hsl(var(--color-primary)/0.1)] text-primary "
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))]"
      }`}
    >
      {label}
      <span
        className={`text-[10px] font-black min-w-[22px] px-1.5 py-0.5 rounded-full transition-colors ${
          isActive
            ? "bg-primary text-white -[0_2px_8px_hsl(var(--color-primary)/0.4)]"
            : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

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
    <div className="group relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]">
      <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-primary to-[hsl(var(--color-primary-strong))] rounded-l-2xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--color-primary)/0.03)] to-transparent pointer-events-none" />
      {/* Avatar */}
      <div className="relative w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-white text-[14px] font-black shrink-0 -[0_2px_10px_hsl(var(--color-secondary)/0.3)] z-10">
        {initialsOf(patient?.fullName)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 z-10">
        <p className="text-[15px] font-black text-[hsl(var(--color-text))] truncate">
          {patient?.fullName ?? "Patient"}
        </p>
        <p className="text-[12px] font-bold text-[hsl(var(--color-primary))] flex items-center gap-1.5 mt-1">
          <LuClock className="text-[11px]" />
          {timeLabel}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0 z-10">
        <StatusBadge status={status} />
        {status === "upcoming" && (
          <button
            onClick={() => onComplete(appt._id)}
            disabled={completing}
            className="flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-xl bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))] hover:bg-[hsl(var(--color-success))] hover:text-white -[0_4px_12px_hsl(var(--color-success)/0.3)] hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-300"
          >
            <LuCheck className="text-[14px]" />
            Complete
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
      className={`group relative flex bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl  overflow-hidden mb-3 transition-all duration-300  hover:-translate-y-1 cursor-pointer ${
        dimmed ? "opacity-60 saturate-50" : ""
      }`}
    >
      {/* Date stub */}
      <div
        className={`w-[90px] sm:w-[110px] shrink-0 flex flex-col items-center justify-center gap-1 py-4 border-r-2 border-dashed border-[hsl(var(--color-border))] relative z-10 ${
          dimmed
            ? "bg-[hsl(var(--color-bg-soft))]"
            : "bg-[hsl(var(--color-primary)/0.05)]"
        }`}
      >
        <span
          className={`text-[11px] font-black uppercase tracking-widest ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-primary"
          }`}
        >
          {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span
          className={`text-[28px] font-black leading-none tracking-tighter ${
            dimmed
              ? "text-[hsl(var(--color-text-muted))]"
              : "text-[hsl(var(--color-text))]"
          }`}
        >
          {new Date(appt.appointmentDate).getDate()}
        </span>
        <span
          className={`text-[11px] font-bold mt-1 ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-primary-strong))]"
          }`}
        >
          {isoTo12Hour(appt.startDateTime)}
        </span>
        {/* Punch holes */}
        <span className="absolute -right-[10px] -top-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))]" />
        <span className="absolute -right-[10px] -bottom-[10px] w-5 h-5 rounded-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))]" />
      </div>

      {/* Body */}
      <div className="flex-1 p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-[hsl(var(--color-bg-surface))] to-transparent">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-white text-[14px] font-black shrink-0">
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

// ─── Slot chip (in schedule view) ─────────────────────────────────────────────
function SlotChip({
  slot,
  onDelete,
  deleting,
}: {
  slot: Slot;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className="group flex items-center justify-between gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl px-3.5 py-3 hover:border-primary -[0_2px_8px_hsl(var(--color-primary)/0.15)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <LuClock className="text-primary text-[13px]" />
        <span className="text-[12.5px] font-bold text-[hsl(var(--color-text))]">
          {slotTimeRangeLabel(slot)}
        </span>
      </div>
      <button
        onClick={() => onDelete(slot._id)}
        disabled={deleting}
        className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] p-1.5 rounded-md transition-all duration-300 disabled:opacity-40"
        title="Delete slot"
      >
        <LuTrash2 className="text-[14px]" />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("appointments");
  const [toast, setToast] = useState<{
    msg: string;
    variant: "success" | "error";
  } | null>(null);

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

  // ── Schedule / Availability ───────────────────────────────────
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());
  const [timeConfig, setTimeConfig] = useState<
    Partial<Record<Day, { startTime: string; endTime: string }>>
  >({});
  const [duration, setDuration] = useState<number>(30);
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [savingDay, setSavingDay] = useState<Day | null>(null);

  const [generateRange, setGenerateRange] = useState({ startDate: "", endDate: "" });
  const [generating, setGenerating] = useState(false);

  // slots fetched after generating (show in the schedule view)
  const [generatedSlots, setGeneratedSlots] = useState<Slot[]>([]);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  function toggleDay(day: Day) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
        if (!timeConfig[day]) {
          setTimeConfig((tc) => ({
            ...tc,
            [day]: { startTime: "09:00", endTime: "17:00" },
          }));
        }
      }
      return next;
    });
  }

  async function handleSaveDay(day: Day) {
    const tc = timeConfig[day];
    if (!tc?.startTime || !tc?.endTime) return;
    setSavingDay(day);
    try {
      await setAvailability({
        day,
        startTime: tc.startTime,
        endTime: tc.endTime,
        appointmentDuration: duration,
      });
      setToast({ msg: `${DAY_LABELS[day]} availability saved`, variant: "success" });
      setExpandedDay(null);
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to save availability", variant: "error" });
    } finally {
      setSavingDay(null);
    }
  }

  async function handleGenerate() {
    if (!generateRange.startDate || !generateRange.endDate) {
      setToast({ msg: "Please pick a start and end date", variant: "error" });
      return;
    }
    setGenerating(true);
    try {
      const res = await generateSlots(generateRange);
      setToast({
        msg: `Generated ${res.count ?? "your"} slots successfully`,
        variant: "success",
      });
    } catch (err: any) {
      setToast({ msg: err.message || "Failed to generate slots", variant: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    setDeletingSlot(slotId);
    try {
      await deleteSlot(slotId);
      setGeneratedSlots((prev) => prev.filter((s) => s._id !== slotId));
      setToast({ msg: "Slot removed", variant: "success" });
    } catch (err: any) {
      setToast({ msg: err.message || "Could not delete slot", variant: "error" });
    } finally {
      setDeletingSlot(null);
    }
  }

  const slotGroups = useMemo(() => groupSlotsByDate(generatedSlots), [generatedSlots]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* ── Header ── */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 -[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-gradient-to-br from-[hsl(var(--color-primary)/0.15)] to-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.1)] text-primary items-center justify-center text-[20px] shrink-0">
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
        <SectionToggle active={section} onChange={setSection} />
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">

        {/* ══════════════════════════════════════════════════════
            SECTION A — APPOINTMENTS
        ══════════════════════════════════════════════════════ */}
        {section === "appointments" && (
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
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION B — MY SCHEDULE
        ══════════════════════════════════════════════════════ */}
        {section === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

            {/* ── LEFT: Weekly availability setup ── */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 duration-200">
              <div className="flex items-center gap-2 mb-1">
                <LuCalendarDays className="text-primary text-[14px]" />
                <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                  Weekly schedule
                </p>
              </div>
              <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mb-5">
                Pick your working days and hours
              </p>

              {/* Appointment duration */}
              <div className="mb-6">
                <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-2">
                  Appointment duration
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-xl text-[12.5px] font-bold border-2 transition-all duration-300 active:scale-95 ${
                        duration === d
                          ? "bg-primary text-white border-primary -[0_4px_14px_hsl(var(--color-primary)/0.3)] -translate-y-0.5"
                          : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-primary)/0.5)] hover:text-primary"
                      }`}
                    >
                      {d} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Days */}
              <div className="space-y-2">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.has(day);
                  const isExpanded = expandedDay === day;
                  const tc = timeConfig[day];

                  return (
                    <div
                      key={day}
                      className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                        isSelected
                          ? "border-primary bg-gradient-to-r from-[hsl(var(--color-primary)/0.05)] to-transparent "
                          : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]"
                      }`}
                    >
                      {/* Day row */}
                      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={(e) => {
                         if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'svg' && (e.target as HTMLElement).tagName !== 'path') {
                           toggleDay(day);
                         }
                      }}>
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleDay(day)}
                          className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isSelected
                              ? "bg-[hsl(var(--color-primary)/0.15)] border-primary text-primary"
                              : "border-[hsl(var(--color-border-strong))] bg-transparent"
                          }`}
                        >
                          {isSelected && <LuCheck className="text-[14px] font-black" />}
                        </button>

                        <span
                          className={`text-[14px] font-black flex-1 transition-colors duration-300 ${
                            isSelected
                              ? "text-[hsl(var(--color-text))]"
                              : "text-[hsl(var(--color-text-muted))]"
                          }`}
                        >
                          {DAY_LABELS[day]}
                        </span>

                        {/* Time summary + expand */}
                        {isSelected && tc && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedDay(isExpanded ? null : day); }}
                            className="flex items-center gap-1.5 text-[12.5px] font-bold text-primary hover:text-primary-strong transition-colors bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.15)] px-3 py-1.5 rounded-lg"
                          >
                            <LuClock className="text-[13px]" />
                            {tc.startTime} – {tc.endTime}
                            <LuChevronDown className={`text-[14px] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {/* Expanded time picker */}
                      <div className={`grid transition-all duration-300 ${isExpanded && isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <div className="border-t border-[hsl(var(--color-primary)/0.1)] bg-[hsl(var(--color-primary)/0.03)] px-5 py-4 flex flex-wrap sm:flex-nowrap items-end gap-3">
                            <div className="flex-1 min-w-[120px]">
                              <label className="block text-[11px] font-bold text-primary mb-1.5">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={tc?.startTime ?? "09:00"}
                                onChange={(e) =>
                                  setTimeConfig((prev) => ({
                                    ...prev,
                                    [day]: { ...prev[day]!, startTime: e.target.value },
                                  }))
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[13px] font-bold outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] transition-all"
                              />
                            </div>
                            <div className="flex-1 min-w-[120px]">
                              <label className="block text-[11px] font-bold text-primary mb-1.5">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={tc?.endTime ?? "17:00"}
                                onChange={(e) =>
                                  setTimeConfig((prev) => ({
                                    ...prev,
                                    [day]: { ...prev[day]!, endTime: e.target.value },
                                  }))
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[13px] font-bold outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] transition-all"
                              />
                            </div>
                            <button
                              onClick={() => handleSaveDay(day)}
                              disabled={savingDay === day}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold -[0_4px_12px_hsl(var(--color-primary)/0.3)] hover:opacity-90 disabled:opacity-60 hover:-translate-y-0.5 transition-all duration-300"
                            >
                              {savingDay === day ? "Saving…" : "Save Day"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT: Generate slots ── */}
            <div className="space-y-5">
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <LuRefreshCw className="text-primary text-[14px]" />
                  <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                    Generate slots
                  </p>
                </div>
                <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mb-4">
                  Pick a date range and we'll create all slots from your weekly schedule
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-1.5">
                      From
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={generateRange.startDate}
                      onChange={(e) =>
                        setGenerateRange((r) => ({ ...r, startDate: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-1.5">
                      To
                    </label>
                    <input
                      type="date"
                      min={generateRange.startDate || new Date().toISOString().split("T")[0]}
                      value={generateRange.endDate}
                      onChange={(e) =>
                        setGenerateRange((r) => ({ ...r, endDate: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating || selectedDays.size === 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--color-primary-strong))] text-white text-[14px] font-black -[0_4px_20px_hsl(var(--color-primary)/0.4)] -[0_6px_25px_hsl(var(--color-primary)/0.5)] hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                >
                  <LuRefreshCw className={`text-[16px] ${generating ? "animate-spin" : ""}`} />
                  {generating ? "Generating..." : "Generate Slots"}
                </button>

                {selectedDays.size === 0 && (
                  <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center mt-2">
                    Select at least one working day first
                  </p>
                )}
              </div>

              {/* Generated slots preview */}
              {slotGroups.length > 0 && (
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <LuClock className="text-primary text-[14px]" />
                    <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                      Generated slots
                    </p>
                  </div>
                  <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                    {slotGroups.map((group) => (
                      <div key={group.dateKey}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">
                          {formatFullDate(group.dateObj)}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {group.slots.map((slot) => (
                            <SlotChip
                              key={slot._id}
                              slot={slot}
                              onDelete={handleDeleteSlot}
                              deleting={deletingSlot === slot._id}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
