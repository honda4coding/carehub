import React from "react";
import { LuChevronDown } from "react-icons/lu";

interface TimePickerSelectProps {
  value: string; // "HH:mm" (24h format)
  onChange: (value: string) => void;
  className?: string;
}

export default function TimePickerSelect({ value, onChange, className }: TimePickerSelectProps) {
  // Parse internal 24h format to 12h + AM/PM for display
  const parseValue = () => {
    if (!value) return { hour: "12", minute: "00", ampm: "AM" };
    const [h, m] = value.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12; // 00:00 -> 12:00 AM, 12:00 -> 12:00 PM
    return {
      hour: hour12.toString().padStart(2, "0"),
      minute: m.toString().padStart(2, "0"),
      ampm,
    };
  };

  const { hour, minute, ampm } = parseValue();

  // Convert updated 12h + AM/PM values back to 24h internal format
  const handleChange = (newHour: string, newMinute: string, newAmpm: string) => {
    let h = parseInt(newHour, 10);
    if (newAmpm === "PM" && h < 12) h += 12;
    if (newAmpm === "AM" && h === 12) h = 0;
    
    const formattedHour = h.toString().padStart(2, "0");
    onChange(`${formattedHour}:${newMinute}`);
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      {/* Hours */}
      <div className="relative flex-1">
        <select
          value={hour}
          onChange={(e) => handleChange(e.target.value, minute, ampm)}
          className="w-full appearance-none px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] text-[14px] font-bold outline-none focus:border-[hsl(var(--color-primary))] transition-all pr-8"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const hStr = h.toString().padStart(2, "0");
            return (
              <option key={hStr} value={hStr}>
                {hStr}
              </option>
            );
          })}
        </select>
        <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-text-muted))] pointer-events-none" />
      </div>

      <span className="text-[hsl(var(--color-text-muted))] font-bold">:</span>

      {/* Minutes */}
      <div className="relative flex-1">
        <select
          value={minute}
          onChange={(e) => handleChange(hour, e.target.value, ampm)}
          className="w-full appearance-none px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] text-[14px] font-bold outline-none focus:border-[hsl(var(--color-primary))] transition-all pr-8"
        >
          {/* Include current value if it's not in standard options (e.g. old DB data) */}
          {!["00", "15", "30", "45"].includes(minute) && (
            <option key={minute} value={minute}>{minute}</option>
          )}
          {["00", "15", "30", "45"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-text-muted))] pointer-events-none" />
      </div>

      {/* AM/PM */}
      <div className="relative w-24">
        <select
          value={ampm}
          onChange={(e) => handleChange(hour, minute, e.target.value)}
          className="w-full appearance-none px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] text-[14px] font-bold outline-none focus:border-[hsl(var(--color-primary))] transition-all pr-8"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
        <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-text-muted))] pointer-events-none" />
      </div>
    </div>
  );
}
