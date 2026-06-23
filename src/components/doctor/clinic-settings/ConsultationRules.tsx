import React from "react";
import { LuClock, LuUsers } from "react-icons/lu";

interface ConsultationRulesProps {
  avgTime: string;
  setAvgTime: (val: string) => void;
  dailyLimit: string;
  setDailyLimit: (val: string) => void;
  allowWalkIns: boolean;
  setAllowWalkIns: (val: boolean) => void;
}

export default function ConsultationRules({
  avgTime,
  setAvgTime,
  dailyLimit,
  setDailyLimit,
  allowWalkIns,
  setAllowWalkIns,
}: ConsultationRulesProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-warning-bg))] flex items-center justify-center text-[hsl(var(--color-warning))]">
          <LuClock />
        </div>
        <h2 className="text-sm font-black uppercase text-[hsl(var(--color-text))]">
          Consultation Rules
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wide">
            Average Consultation Time (mins)
          </label>
          <input
            type="number"
            value={avgTime}
            onChange={(e) => setAvgTime(e.target.value)}
            className="w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[13px] font-bold rounded-xl px-4 py-2 outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
          />
          <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-1">
            Used to calculate booking slots.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wide">
            Daily Patient Limit
          </label>
          <input
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            className="w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[13px] font-bold rounded-xl px-4 py-2 outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
          />
          <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-1">
            Maximum walk-in patients per day.
          </p>
        </div>

        <div className="md:col-span-2 mt-2 p-4 rounded-xl border border-[hsl(var(--color-border))] flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-bold text-[hsl(var(--color-text))] flex items-center gap-2">
              <LuUsers /> Allow Walk-ins
            </h3>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5">
              Accept patients without prior online booking.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={allowWalkIns}
              onChange={() => setAllowWalkIns(!allowWalkIns)}
            />
            <div className="w-11 h-6 bg-[hsl(var(--color-border))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[hsl(var(--color-border-soft))] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(var(--color-primary))]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
