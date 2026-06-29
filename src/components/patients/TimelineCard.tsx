"use client";
import { useState } from "react";
import { LuStethoscope, LuChevronDown, LuChevronUp, LuCalendar, LuHeartPulse, LuActivity, LuThermometer } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";
import { useTranslations } from "next-intl";

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

export default function TimelineCard({ entry }: Props) {
  const t = useTranslations("patient.TimelineCard");
  const [expanded, setExpanded] = useState(false);
  const severity = getSeverity(entry.diagnosis || "");

  const record = entry.rawRecord;
  const tempVal = parseFloat(record?.temperature);
  const highTemp = !isNaN(tempVal) && tempVal >= 38;

  return (
    <div className={`bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden transition-all duration-200
      ${expanded ? "border-[hsl(var(--color-primary)/0.4)] shadow-sm" : "hover:border-[hsl(var(--color-border))]"}`}>

      {/* ── Clickable Header ── */}
      <div
        className="flex cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Severity bar */}
        <div className={`w-[3px] shrink-0 rounded-s-2xl ${SEVERITY_BAR[severity]}`} />

        <div className="flex-1 px-4 py-3.5">
          {/* Date + badge */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
              <LuCalendar className="text-[11px]" /> {entry.date}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${SEVERITY_BADGE[severity]}`}>
              {severity === "critical" ? t("critical") : severity === "warning" ? t("followUp") : t("routine")}
            </span>
          </div>

          {/* Diagnosis */}
          <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] leading-snug mb-1">
            {entry.diagnosis || t("noDiagnosis")}
          </p>

          {/* Doctor */}
          <p className="text-[12px] text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
            <LuStethoscope className="text-[11px] shrink-0" />
            <span className="font-medium text-[hsl(var(--color-text))]">{entry.doctorName}</span>
            {entry.specialty && <span className="opacity-60">· {entry.specialty}</span>}
          </p>

          {/* Inline vitals from rawRecord */}
          {record && (record.bloodPressure || record.pulse || record.temperature) && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {record.bloodPressure && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]">
                  <LuHeartPulse className="text-[10px]" /> {t("bp")} <span className="font-semibold text-[hsl(var(--color-text))]">{record.bloodPressure}</span>
                </span>
              )}
              {record.pulse && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]">
                  <LuActivity className="text-[10px]" /> {t("pulse")} <span className="font-semibold text-[hsl(var(--color-text))]">{record.pulse} {t("bpm")}</span>
                </span>
              )}
              {record.temperature && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                  highTemp
                    ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))]"
                    : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                }`}>
                  <LuThermometer className="text-[10px]" /> {t("temp")} <span className="font-semibold">{record.temperature}°C</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="flex items-center pe-4 ps-1 text-[hsl(var(--color-text-muted))]">
          {expanded ? <LuChevronUp className="text-[15px]" /> : <LuChevronDown className="text-[15px]" />}
        </div>
      </div>

      {/* ── Expanded Body ── */}
      {expanded && (
        <div
          className="border-t border-[hsl(var(--color-border))] p-4 animate-in fade-in slide-in-from-top-1 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {entry.rawRecord ? (
            <MedicalHistoryCard record={entry.rawRecord} hideHeader={true} />
          ) : (
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] text-center py-4 italic">
              {t("notAvailable")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
