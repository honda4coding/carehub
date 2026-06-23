import React from "react";
import { LuCalendarDays } from "react-icons/lu";

export interface ScheduleDay {
  day: string;
  active: boolean;
  open: string;
  close: string;
}

interface WorkingHoursSetupProps {
  schedule: ScheduleDay[];
  setSchedule: (schedule: ScheduleDay[]) => void;
}

export default function WorkingHoursSetup({
  schedule,
  setSchedule,
}: WorkingHoursSetupProps) {
  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const updateTime = (index: number, field: "open" | "close", value: string) => {
    const newSch = [...schedule];
    newSch[index][field] = value;
    setSchedule(newSch);
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 lg:col-span-1">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-[hsl(var(--color-primary))]">
          <LuCalendarDays />
        </div>
        <h2 className="text-sm font-black uppercase text-[hsl(var(--color-text))]">
          Working Hours
        </h2>
      </div>

      <div className="space-y-3">
        {schedule.map((day, idx) => (
          <div
            key={day.day}
            className={`p-3 rounded-xl border ${
              day.active
                ? "border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-primary)/0.02)]"
                : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] opacity-60"
            } transition-colors`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={() => toggleDay(idx)}
                  className="w-4 h-4 rounded text-primary cursor-pointer"
                />
                <span className="text-[13px] font-bold text-[hsl(var(--color-text))]">
                  {day.day}
                </span>
              </label>
              {!day.active && (
                <span className="text-[10px] font-bold text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.1)] px-2 py-0.5 rounded-md">
                  Closed
                </span>
              )}
            </div>

            {day.active && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.open}
                  onChange={(e) => updateTime(idx, "open", e.target.value)}
                  className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[12px] font-medium rounded-lg px-2 py-1 outline-none"
                />
                <span className="text-[hsl(var(--color-text-muted))] text-xs">
                  to
                </span>
                <input
                  type="time"
                  value={day.close}
                  onChange={(e) => updateTime(idx, "close", e.target.value)}
                  className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[12px] font-medium rounded-lg px-2 py-1 outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
