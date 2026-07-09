"use client";
import { useState } from "react";
import { LuStethoscope, LuChevronDown, LuChevronUp, LuCalendar, LuHeartPulse, LuActivity, LuThermometer } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";


interface Props {
  entry: TimelineEntry;
}

type Severity = "critical" | "warning" | "normal";
function getSeverity(diag: string): Severity {
  const d = diag.toLowerCase();
  if (d.includes("crisis") || d.includes("emergency") || d.includes("acute") || d.includes("severe")) return "critical";
  if (d.includes("infection") || d.includes("fever") || d.includes("inflammation") || d.includes("chronic")) return "warning";
  return "normal";
}
const SEVERITY_BAR: Record<Severity, string> = {
  critical: "bg-[hsl(var(--color-danger))]",
  warning:  "bg-[hsl(var(--color-warning))]",
  normal:   "bg-[hsl(var(--color-primary))]",
};
const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] border-[hsl(var(--color-danger)/0.2)]",
  warning:  "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] border-[hsl(var(--color-warning)/0.2)]",
  normal:   "bg-[hsl(var(--color-primary)/0.08)] text-[hsl(var(--color-primary-strong))] border-[hsl(var(--color-primary)/0.2)]",
};

import TimelineAccordionCard from "@/components/shared/TimelineAccordionCard";

export default function TimelineCard({ entry }: Props) {
  if (entry.rawRecord) {
    return <TimelineAccordionCard record={entry.rawRecord} />;
  }

  // Fallback for entries without rawRecord
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
          {entry.date}
        </div>
      </div>
      <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] leading-snug mb-1">
        {entry.diagnosis || "No diagnosis recorded"}
      </p>
      <p className="text-[12px] text-[hsl(var(--color-text-muted))]">
        <span className="font-medium text-[hsl(var(--color-text))]">{entry.doctorName}</span>
        {entry.specialty && <span className="opacity-60"> · {entry.specialty}</span>}
      </p>
    </div>
  );
}
