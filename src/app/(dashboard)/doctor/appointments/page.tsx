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
    <div className="inline-flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))]">
      {(["appointments", "schedule"] as Section[]).map((s) => {
        const isActive = s === active;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-4 py-2 rounded-[9px] text-[12.5px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isActive
                ? "bg-primary text-white shadow-[0_2px_8px_hsl(var(--color-primary)/0.35)]"
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-surface))]"
            }`}
          >
            {s === "appointments" ? (
              <><LuUsers className="text-[13px]" />Appointments</>
            ) : (
              <><LuSettings2 className="text-[13px]" />My Schedule</>
            )}
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
      className={`relative px-4 py-2.5 rounded-[10px] text-[12.5px] font-bold transition-all duration-200 flex items-center gap-2 ${
        isActive
          ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-primary-strong))] shadow-sm ring-1 ring-[hsl(var(--color-border))]"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
      }`}
    >
      {label}
      <span
        className={`text-[10.5px] font-bold min-w-[20px] px-1.5 py-0.5 rounded-full transition-colors ${
          isActive
            ? "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]"
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
        <span className="absolute -right-[8px] -top-[8px] w-4 h-4 rounded-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))]" />
        <span className="absolute -right-[8px] -bottom-[8px] w-4 h-4 rounded-full bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))]" />
      </div>

      {/* Body */}
      <div className="flex-1 p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white text-[13px] font-black shrink-0 ring-2 ring-[hsl(var(--color-bg-surface))] shadow-sm">
            {initialsOf(patient?.fullName)}
          </div>
          <div className="min-w-0">
            <p
              className={`text-[14px] font-bold truncate ${
                dimmed
                  ? "text-[hsl(var(--color-text-muted))] line-through"
                  : "text-[hsl(var(--color-text))]"
              }`}
            >
              {patient?.fullName ?? "Patient"}
            </p>
            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] truncate flex items-center gap-1 mt-0.5">
              <LuClock className="text-[10px]" />
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
    <div className="flex items-center justify-between gap-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl px-3 py-2.5 hover:border-[hsl(var(--color-text-muted)/0.3)] transition-colors duration-150">
      <span className="text-[12.5px] font-bold text-[hsl(var(--color-text))]">
        {slotTimeRangeLabel(slot)}
      </span>
      <button
        onClick={() => onDelete(slot._id)}
        disabled={deleting}
        className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors disabled:opacity-40"
        title="Delete slot"
      >
        <LuTrash2 className="text-[13px]" />
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
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow-[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 rounded-[12px] bg-[hsl(var(--color-primary)/0.12)] text-primary items-center justify-center text-[18px] shrink-0">
            <LuCalendarDays />
          </div>
          <div>
            <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              Appointments
            </h1>
            <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
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
            <div className="inline-flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1.5 rounded-[14px] border border-[hsl(var(--color-border))] mb-6">
              <ApptTab label="Today" value="today" active={tab} count={grouped.today.length} onClick={() => setTab("today")} />
              <ApptTab label="Upcoming" value="upcoming" active={tab} count={grouped.upcoming.length} onClick={() => setTab("upcoming")} />
              <ApptTab label="Completed" value="completed" active={tab} count={grouped.completed.length} onClick={() => setTab("completed")} />
              <ApptTab label="Cancelled" value="cancelled" active={tab} count={grouped.cancelled.length} onClick={() => setTab("cancelled")} />
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
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                      className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold border transition-all duration-150 ${
                        duration === d
                          ? "bg-primary text-white border-primary shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)]"
                          : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:border-primary hover:text-primary"
                      }`}
                    >
                      {d} min
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
                      className={`border rounded-xl overflow-hidden transition-all duration-150 ${
                        isSelected
                          ? "border-primary bg-[hsl(var(--color-primary)/0.04)]"
                          : "border-[hsl(var(--color-border))]"
                      }`}
                    >
                      {/* Day row */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleDay(day)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                            isSelected
                              ? "bg-primary border-primary shadow-[0_2px_6px_hsl(var(--color-primary)/0.4)]"
                              : "border-[hsl(var(--color-border))] hover:border-primary"
                          }`}
                        >
                          {isSelected && <LuCheck className="text-white text-[11px]" />}
                        </button>

                        <span
                          className={`text-[13px] font-bold flex-1 ${
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
                            onClick={() => setExpandedDay(isExpanded ? null : day)}
                            className="flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:text-primary-strong transition-colors"
                          >
                            {tc.startTime} – {tc.endTime}
                            {isExpanded ? (
                              <LuChevronDown className="text-[12px]" />
                            ) : (
                              <LuChevronRight className="text-[12px]" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Expanded time picker */}
                      {isSelected && isExpanded && (
                        <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] px-4 py-3 flex items-end gap-3">
                          <div className="flex-1">
                            <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1">
                              Start
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
                              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1">
                              End
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
                              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[13px] font-medium outline-none focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveDay(day)}
                            disabled={savingDay === day}
                            className="px-4 py-2 rounded-lg bg-primary text-white text-[12px] font-bold shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)] hover:opacity-90 disabled:opacity-60 transition-opacity"
                          >
                            {savingDay === day ? "Saving…" : "Save"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT: Generate slots ── */}
            <div className="space-y-5">
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                  className="w-full py-3 rounded-xl bg-primary text-white text-[13.5px] font-bold shadow-[0_4px_14px_hsl(var(--color-primary)/0.35)] hover:opacity-90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <LuRefreshCw className={`text-[14px] ${generating ? "animate-spin" : ""}`} />
                  {generating ? "Generating…" : "Generate slots"}
                </button>

                {selectedDays.size === 0 && (
                  <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center mt-2">
                    Select at least one working day first
                  </p>
                )}
              </div>

              {/* Generated slots preview */}
              {slotGroups.length > 0 && (
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
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
