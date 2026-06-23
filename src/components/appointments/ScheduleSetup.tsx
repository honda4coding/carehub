import { useState } from "react";
import { LuCalendarDays, LuCheck, LuChevronDown, LuClock } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { setAvailability } from "@/services/appointmentService";

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

interface ScheduleSetupProps {
  onToast: (msg: string, variant: "success" | "error") => void;
  onSelectedDaysChange?: (hasDays: boolean) => void;
}

export default function ScheduleSetup({ onToast, onSelectedDaysChange }: ScheduleSetupProps) {
  const [selectedDays, setSelectedDays] = useState<Set<Day>>(new Set());
  const [timeConfig, setTimeConfig] = useState<
    Partial<Record<Day, { startTime: string; endTime: string }>>
  >({});
  const [duration, setDuration] = useState<number>(30);
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [savingDay, setSavingDay] = useState<Day | null>(null);

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
      if (onSelectedDaysChange) onSelectedDaysChange(next.size > 0);
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
      onToast(`${DAY_LABELS[day]} availability saved`, "success");
      setExpandedDay(null);
    } catch (err: any) {
      onToast(err.message || "Failed to save availability", "error");
    } finally {
      setSavingDay(null);
    }
  }

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <LuCalendarDays className="text-[hsl(var(--color-primary))] text-base" />
        <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
          Weekly schedule
        </p>
      </div>
      <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mb-5">
        Pick your working days and hours
      </p>

      {/* Appointment duration */}
      <div className="mb-6">
        <label className="block text-base font-bold text-[hsl(var(--color-text))] mb-2">
          Appointment duration
        </label>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-4 py-2 rounded-xl text-base font-bold border-2 transition-all duration-300 active:scale-95 cursor-pointer ${
                duration === d
                  ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))]"
                  : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))]"
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
                  ? "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-surface))]"
                  : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-text-muted))]"
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
                  className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))]"
                      : "border-[hsl(var(--color-border))] bg-transparent"
                  }`}
                >
                  {isSelected && <LuCheck className="text-base font-black" />}
                </button>

                <span
                  className={`text-base font-black flex-1 transition-colors duration-300 ${
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
                    className="flex items-center gap-1.5 text-base font-bold text-[hsl(var(--color-text-inverse))] hover:opacity-90 transition-opacity bg-[hsl(var(--color-primary))] px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <LuClock className="text-base" />
                    {tc.startTime} – {tc.endTime}
                    <LuChevronDown className={`text-base transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {/* Expanded time picker */}
              <div className={`grid transition-all duration-300 ${isExpanded && isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] px-5 py-4 flex flex-wrap sm:flex-nowrap items-end gap-3">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-sm font-bold text-[hsl(var(--color-text))] mb-1.5">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-base font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] transition-all"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-sm font-bold text-[hsl(var(--color-text))] mb-1.5">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-base font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] transition-all"
                      />
                    </div>
                    <Button
                      onClick={() => handleSaveDay(day)}
                      isLoading={savingDay === day}
                      className="w-full sm:w-auto !px-6 !py-2.5 !h-[42px] !rounded-xl !bg-[hsl(var(--color-primary))] !text-[hsl(var(--color-text-inverse))] hover:!bg-[hsl(var(--color-primary-strong))]"
                    >
                      Save Day
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
