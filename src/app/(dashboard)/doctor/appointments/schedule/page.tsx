"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuClock,
  LuPencil,
  LuRefreshCw,
  LuSettings2,
  LuTrash2,
} from "react-icons/lu";

import { useAuth } from "@/context/AuthContext";
import {
  Availability,
  Slot,
  deleteAvailability,
  deleteSlot,
  generateSlots,
  getAvailableSlots,
  getMyAvailability,
  setAvailability,
} from "@/services/appointmentService";
import {
  formatFullDate,
  groupSlotsByDate,
  slotTimeRangeLabel,
} from "@/components/appointments/format";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import SectionToggle from "@/components/appointments/SectionToggle";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

// ─── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
type Day = (typeof DAYS)[number];

const DAY_LABELS: Record<Day, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const DURATIONS = [15, 20, 30, 45, 60] as const;

type DayConfig = {
  startTime: string;
  endTime: string;
  appointmentDuration: number;
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const doctorId = (user as any)?._id ?? user?.id ?? "";

  const [toast, setToast] = useState<{
    msg: string;
    variant: "success" | "error";
  } | null>(null);

  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());
  const [timeConfig, setTimeConfig] = useState<Partial<Record<Day, DayConfig>>>(
    {},
  );
  const [savedIds, setSavedIds] = useState<Partial<Record<Day, string>>>({});
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [savingDay, setSavingDay] = useState<Day | null>(null);
  const [deletingDay, setDeletingDay] = useState<Day | null>(null);

  const [generateRange, setGenerateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [generating, setGenerating] = useState(false);

  const [mySlots, setMySlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  // which date group is open in the slots dropdown
  const [openSlotDay, setOpenSlotDay] = useState<string | null>(null);

  // ── Load existing weekly schedule + open slots on mount ────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAvailability();
        const days = new Set<Day>();
        const config: Partial<Record<Day, DayConfig>> = {};
        const ids: Partial<Record<Day, string>> = {};
        data.forEach((a) => {
          const day = a.day?.toLowerCase() as Day;
          if (!DAYS.includes(day)) return;
          days.add(day);
          config[day] = {
            startTime: a.startTime,
            endTime: a.endTime,
            appointmentDuration: a.appointmentDuration,
          };
          ids[day] = a._id;
        });
        setSelectedDays(days);
        setTimeConfig(config);
        setSavedIds(ids);
      } catch (err: any) {
        setToast({
          msg: err.message || "Failed to load your schedule",
          variant: "error",
        });
      } finally {
        setLoadingAvailability(false);
      }
    })();
  }, []);

  async function loadMySlots() {
    if (!doctorId) return;
    setSlotsLoading(true);
    try {
      const data = await getAvailableSlots(doctorId);
      setMySlots(data);
    } catch (err: any) {
      setToast({
        msg: err.message || "Failed to load your open slots",
        variant: "error",
      });
    } finally {
      setSlotsLoading(false);
    }
  }

  useEffect(() => {
    loadMySlots();
  }, [doctorId]);

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
            [day]: {
              startTime: "09:00",
              endTime: "17:00",
              appointmentDuration: 30,
            },
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
      const saved = await setAvailability({
        day,
        startTime: tc.startTime,
        endTime: tc.endTime,
        appointmentDuration: tc.appointmentDuration,
      });
      setSavedIds((prev) => ({ ...prev, [day]: saved._id }));
      setToast({
        msg: `${DAY_LABELS[day]} availability ${savedIds[day] ? "updated" : "saved"}`,
        variant: "success",
      });
      setExpandedDay(null);
    } catch (err: any) {
      setToast({
        msg: err.message || "Failed to save availability",
        variant: "error",
      });
    } finally {
      setSavingDay(null);
    }
  }

  async function handleDeleteDay(day: Day) {
    const id = savedIds[day];
    if (!id) {
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.delete(day);
        return next;
      });
      return;
    }
    setDeletingDay(day);
    try {
      await deleteAvailability(id);
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.delete(day);
        return next;
      });
      setTimeConfig((prev) => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
      setSavedIds((prev) => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
      setToast({
        msg: `${DAY_LABELS[day]} availability removed`,
        variant: "success",
      });
    } catch (err: any) {
      setToast({
        msg: err.message || "Could not remove this day",
        variant: "error",
      });
    } finally {
      setDeletingDay(null);
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
      loadMySlots();
    } catch (err: any) {
      setToast({
        msg: err.message || "Failed to generate slots",
        variant: "error",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    setDeletingSlot(slotId);
    try {
      await deleteSlot(slotId);
      setMySlots((prev) => prev.filter((s) => s._id !== slotId));
      setToast({ msg: "Slot removed", variant: "success" });
    } catch (err: any) {
      setToast({
        msg: err.message || "Could not delete slot",
        variant: "error",
      });
    } finally {
      setDeletingSlot(null);
    }
  }

  async function handleDeleteDaySlots(slots: Slot[]) {
    try {
      await Promise.all(slots.map((s) => deleteSlot(s._id)));
      const deletedIds = new Set(slots.map((s) => s._id));
      setMySlots((prev) => prev.filter((s) => !deletedIds.has(s._id)));
      setToast({ msg: "All slots for this day removed", variant: "success" });
    } catch (err: any) {
      setToast({
        msg: err.message || "Could not delete some slots",
        variant: "error",
      });
    }
  }

  const slotGroups = useMemo(() => groupSlotsByDate(mySlots), [mySlots]);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4 -[0_1px_0_hsl(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-[14px] bg-gradient-to-br from-[hsl(var(--color-primary)/0.15)] to-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.1)] text-primary items-center justify-center text-xl shrink-0">
            <LuSettings2 />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] tracking-tight pl-11 md:pl-0">
              My Schedule
            </h1>
            <p className="text-base font-bold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
              Set your weekly hours and generate bookable slots
            </p>
          </div>
        </div>
        <SectionToggle />
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl w-full h-fit">
          {/* ── LEFT: Weekly availability setup ── */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 duration-200">
            <div className="flex items-center gap-2 mb-1">
              <LuCalendarDays className="text-primary text-base" />
              <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                Weekly schedule
              </p>
            </div>
            <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mb-5">
              Pick your working days and hours
            </p>

            {loadingAvailability ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[46px] rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.has(day);
                  const isExpanded = expandedDay === day;
                  const tc = timeConfig[day];
                  const isSaved = !!savedIds[day];

                  return (
                    <div
                      key={day}
                      className={`border rounded-xl overflow-hidden transition-all duration-150 ${
                        isSelected
                          ? "border-primary bg-[hsl(var(--color-primary)/0.04)]"
                          : "border-[hsl(var(--color-border))]"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleDay(day)}
                          className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-[hsl(var(--color-primary)/0.15)] border-primary text-primary"
                              : "border-[hsl(var(--color-border))] bg-transparent"
                          }`}
                        >
                          {isSelected && <LuCheck className="text-base font-black" />}
                        </button>

                        <span
                          className={`text-base font-bold flex-1 flex items-center gap-1.5 ${
                            isSelected
                              ? "text-[hsl(var(--color-text))]"
                              : "text-[hsl(var(--color-text-muted))]"
                          }`}
                        >
                          {DAY_LABELS[day]}
                          {isSaved && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]">
                              Saved
                            </span>
                          )}
                        </span>

                        {isSelected && tc && (
                          <button
                            onClick={() =>
                              setExpandedDay(isExpanded ? null : day)
                            }
                            className="flex items-center gap-1.5 text-base font-bold text-[hsl(var(--color-text))] hover:opacity-70 transition-opacity cursor-pointer"
                          >
                            {tc.startTime} – {tc.endTime}
                            {isExpanded ? (
                              <LuChevronDown className="text-base" />
                            ) : (
                              <LuChevronRight className="text-base" />
                            )}
                          </button>
                        )}

                        {isSaved && (
                          <button
                            onClick={() => handleDeleteDay(day)}
                            disabled={deletingDay === day}
                            className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                          >
                            <LuTrash2 className="text-base" />
                          </button>
                        )}
                      </div>

                      {isSelected && isExpanded && (
                        <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] p-5 space-y-5">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-black uppercase tracking-wide text-[hsl(var(--color-text))] mb-2">
                                Start Time
                              </label>
                              <div className="relative group">
                                <input
                                  type="time"
                                  value={tc?.startTime ?? "09:00"}
                                  onChange={(e) =>
                                    setTimeConfig((prev) => ({
                                      ...prev,
                                      [day]: {
                                        ...prev[day]!,
                                        startTime: e.target.value,
                                      },
                                    }))
                                  }
                                  onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-base font-bold outline-none focus:border-[hsl(var(--color-text))] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-4 focus:ring-[hsl(var(--color-text))/0.05] transition-all group-hover:border-[hsl(var(--color-text))/30] cursor-pointer"
                                />
                                <LuClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-lg group-focus-within:text-[hsl(var(--color-text))] transition-colors" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-black uppercase tracking-wide text-[hsl(var(--color-text))] mb-2">
                                End Time
                              </label>
                              <div className="relative group">
                                <input
                                  type="time"
                                  value={tc?.endTime ?? "17:00"}
                                  onChange={(e) =>
                                    setTimeConfig((prev) => ({
                                      ...prev,
                                      [day]: {
                                        ...prev[day]!,
                                        endTime: e.target.value,
                                      },
                                    }))
                                  }
                                  onClick={(e) => 'showPicker' in e.currentTarget && e.currentTarget.showPicker()}
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-base font-bold outline-none focus:border-[hsl(var(--color-text))] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-4 focus:ring-[hsl(var(--color-text))/0.05] transition-all group-hover:border-[hsl(var(--color-text))/30] cursor-pointer"
                                />
                                <LuClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] text-lg group-focus-within:text-[hsl(var(--color-text))] transition-colors" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-black uppercase tracking-wide text-[hsl(var(--color-text))] mb-2.5">
                              Appointment Duration
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {DURATIONS.map((d) => (
                                <button
                                  key={d}
                                  onClick={() =>
                                    setTimeConfig((prev) => ({
                                      ...prev,
                                      [day]: {
                                        ...prev[day]!,
                                        appointmentDuration: d,
                                      },
                                    }))
                                  }
                                  className={`px-4 py-2 rounded-xl text-base font-bold border transition-all duration-300 cursor-pointer ${
                                    tc?.appointmentDuration === d
                                      ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-md -translate-y-0.5"
                                      : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] hover:-translate-y-0.5"
                                  }`}
                                >
                                  {d} min
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => handleSaveDay(day)}
                              disabled={savingDay === day}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] hover:bg-[hsl(var(--color-primary-strong))] hover:shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 text-base font-black disabled:opacity-60 disabled:pointer-events-none transition-all duration-300 cursor-pointer"
                            >
                              {isSaved && <LuPencil className="text-base" />}
                              {savingDay === day
                                ? "Saving…"
                                : isSaved
                                  ? "Update Schedule"
                                  : "Save Schedule"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Generate + slots ── */}
          <div className="space-y-5">
            {/* Generate slots card */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 duration-200">
              <div className="flex items-center gap-2 mb-1">
                <LuRefreshCw className="text-primary text-base" />
                <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                  Generate slots
                </p>
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mb-4">
                Pick a date range and we will create all slots from your saved
                weekly schedule
              </p>

              <div className="mb-4">
                <DateRangeFilter
                  startDate={generateRange.startDate}
                  endDate={generateRange.endDate}
                  minStartDate={new Date().toISOString().split("T")[0]}
                  minEndDate={generateRange.startDate || new Date().toISOString().split("T")[0]}
                  onStartDateChange={(val) => setGenerateRange((r) => ({ ...r, startDate: val }))}
                  onEndDateChange={(val) => setGenerateRange((r) => ({ ...r, endDate: val }))}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || selectedDays.size === 0}
                className="w-full py-3.5 rounded-xl bg-primary text-white text-base font-bold -[0_4px_14px_hsl(var(--color-primary)/0.35)] hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LuRefreshCw
                  className={`text-base ${generating ? "animate-spin" : ""}`}
                />
                {generating ? "Generating…" : "Generate slots"}
              </button>

              {selectedDays.size === 0 && (
                <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] text-center mt-2">
                  Select at least one working day first
                </p>
              )}
            </div>

            {/* ── Open slots — grouped by day, collapsible ── */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LuClock className="text-primary text-base" />
                  <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
                    Open slots
                  </p>
                </div>
                {!slotsLoading && mySlots.length > 0 && (
                  <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-primary">
                    {mySlots.length} total
                  </span>
                )}
              </div>

              {slotsLoading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[48px] rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse"
                    />
                  ))}
                </div>
              ) : slotGroups.length === 0 ? (
                <p className="text-base font-semibold text-[hsl(var(--color-text-muted))] text-center py-6">
                  No open slots yet — generate some above.
                </p>
              ) : (
                <div className="space-y-2">
                  {slotGroups.map((group) => {
                    const isOpen = openSlotDay === group.dateKey;
                    return (
                      <div
                        key={group.dateKey}
                        className="border border-[hsl(var(--color-border))] rounded-xl overflow-hidden"
                      >
                        {/* Day header */}
                        <div className="w-full flex items-center justify-between px-4 py-3">
                          {/* الجزء القابل للضغط للفتح */}
                          <button
                            onClick={() =>
                              setOpenSlotDay(isOpen ? null : group.dateKey)
                            }
                            className="flex items-center gap-3 flex-1 text-left hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-primary flex items-center justify-center shrink-0">
                              <LuCalendarDays className="text-base" />
                            </div>
                            <div>
                              <p className="text-base font-black text-[hsl(var(--color-text))]">
                                {formatFullDate(group.dateObj)}
                              </p>
                              <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">
                                {group.slots.length} slot
                                {group.slots.length !== 1 ? "s" : ""} available
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-2">
                            {/* زرار حذف اليوم كامل */}
                            <button
                              onClick={() => handleDeleteDaySlots(group.slots)}
                              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors p-1 cursor-pointer"
                              title="Delete all slots for this day"
                            >
                              <LuTrash2 className="text-base" />
                            </button>

                            <LuChevronDown
                              onClick={() =>
                                setOpenSlotDay(isOpen ? null : group.dateKey)
                              }
                              className={`text-[hsl(var(--color-text-muted))] text-base transition-transform duration-200 cursor-pointer ${isOpen ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>

                        {/* Expanded list — the individual slots for this day */}
                        {isOpen && (
                          <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] px-4 py-3">
                            <div className="grid grid-cols-1 gap-2">
                              {group.slots.map((slot) => (
                                <div
                                    key={slot._id}
                                    className="group flex items-center justify-between gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl px-3.5 py-3 hover:border-primary -[0_2px_8px_hsl(var(--color-primary)/0.15)] hover:-translate-y-0.5 transition-all duration-300"
                                  >
                                    <div className="flex items-center gap-2">
                                      <LuClock className="text-primary text-base" />
                                      <span className="text-base font-bold text-[hsl(var(--color-text))]">
                                        {slotTimeRangeLabel(slot)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSlot(slot._id)}
                                      disabled={deletingSlot === slot._id}
                                      className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] p-1.5 rounded-md transition-all duration-300 disabled:opacity-40 shrink-0 cursor-pointer"
                                      title="Delete this slot"
                                    >
                                      <LuTrash2 className="text-base" />
                                    </button>
                                  </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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