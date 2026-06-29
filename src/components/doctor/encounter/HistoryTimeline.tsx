import {
  LuHistory, LuStethoscope, LuFileText, LuCalendar,
  LuChevronDown, LuChevronUp, LuSearch, LuX,
  LuHeartPulse, LuActivity, LuThermometer,
} from "react-icons/lu";
import { RefObject, useState } from "react";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

/* ── Severity helper ── */
type Severity = "critical" | "warning" | "normal";
function getSeverity(record: any): Severity {
  const d = (record.diagnosis || "").toLowerCase();
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

/* ── VitalChip ── */
function VitalChip({ icon, label, value, highlight = false }: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  if (!value || value === "--") return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
      highlight
        ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))]"
        : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
    }`}>
      <span className="text-[10px]">{icon}</span>
      <span>{label}</span>
      <span className={`font-semibold ${highlight ? "text-[hsl(var(--color-danger))]" : "text-[hsl(var(--color-text))]"}`}>
        {value}
      </span>
    </span>
  );
}

/* ── Accordion Card ── */
function TimelineAccordionCard({ record }: { record: any }) {
  const [expanded, setExpanded] = useState(false);
  const severity = getSeverity(record);

  const dateStr = new Date(record.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const timeStr = new Date(record.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  const tempVal = parseFloat(record.temperature);
  const highTemp = !isNaN(tempVal) && tempVal >= 38;

  return (
    <div className={`bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden transition-all duration-200
      ${expanded ? "border-[hsl(var(--color-primary)/0.4)] shadow-sm" : "hover:border-[hsl(var(--color-border))]"}`}>

      {/* Clickable header */}
      <div
        className="flex cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Severity accent */}
        <div className={`w-[3px] shrink-0 rounded-s-2xl ${SEVERITY_BAR[severity]}`} />

        <div className="flex-1 px-4 py-3.5">
          {/* Date + badge row */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
              <LuCalendar className="text-[11px]" /> {dateStr}
              <span className="opacity-40">·</span> {timeStr}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${SEVERITY_BADGE[severity]}`}>
              {severity === "critical" ? "Critical" : severity === "warning" ? "Follow-up" : "Routine"}
            </span>
          </div>

          {/* Diagnosis */}
          <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] leading-snug mb-1">
            {record.diagnosis || "No diagnosis recorded"}
          </p>

          {/* Doctor */}
          <p className="text-[12px] text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
            <LuStethoscope className="text-[11px] shrink-0" />
            <span className="font-medium text-[hsl(var(--color-text))]">
              {record.doctorId?.fullName ?? record.doctorId?.userName ?? "Doctor"}
            </span>
            {record.doctorId?.specialization && (
              <span className="opacity-60">· {record.doctorId.specialization}</span>
            )}
          </p>

          {/* Inline vitals */}
          {(record.bloodPressure || record.pulse || record.temperature) && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <VitalChip icon={<LuHeartPulse />} label="BP" value={record.bloodPressure} />
              <VitalChip icon={<LuActivity />} label="Pulse" value={record.pulse ? `${record.pulse} bpm` : ""} />
              <VitalChip icon={<LuThermometer />} label="Temp" value={record.temperature ? `${record.temperature}°C` : ""} highlight={highTemp} />
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="flex items-center pe-4 ps-1 text-[hsl(var(--color-text-muted))]">
          {expanded ? <LuChevronUp className="text-[15px]" /> : <LuChevronDown className="text-[15px]" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div
          className="border-t border-[hsl(var(--color-border))] p-4 animate-in fade-in slide-in-from-top-1 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <MedicalHistoryCard record={record} hideHeader={true} />
        </div>
      )}
    </div>
  );
}

/* ── Props ── */
interface HistoryTimelineProps {
  setIsAssessmentMode: (mode: boolean) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  loadingHistory: boolean;
  page: number;
  fullMedicalHistory: any[];
  hasMore: boolean;
  observerTarget: RefObject<HTMLDivElement | null>;
}

/* ── Main Component ── */
export default function HistoryTimeline({
  setIsAssessmentMode,
  startDate, setStartDate,
  endDate, setEndDate,
  filterText, setFilterText,
  loadingHistory, page,
  fullMedicalHistory,
  hasMore, observerTarget,
}: HistoryTimelineProps) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
        <h3 className="text-[15px] font-semibold text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
          <LuHistory className="text-[hsl(var(--color-primary))]" /> Full medical history
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full 2xl:w-auto">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={startDate || endDate ? () => { setStartDate(""); setEndDate(""); } : undefined}
            className="!mt-0"
          />
          <div className="relative flex-1 min-w-0">
            <LuSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search doctor, diagnosis…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full ps-8 pe-8 py-2 text-[12px] font-medium rounded-xl border border-[hsl(var(--color-border))]
                bg-[hsl(var(--color-bg-surface-hover))] outline-none text-[hsl(var(--color-text))]
                focus:border-[hsl(var(--color-primary))] transition-colors
                placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
            />
            {filterText && (
              <button
                onClick={() => setFilterText("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] cursor-pointer"
              >
                <LuX className="text-[12px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {loadingHistory && page === 1 ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-[hsl(var(--color-bg-surface-hover))] rounded-2xl border border-[hsl(var(--color-border))]" />
            ))}
          </div>
        ) : fullMedicalHistory.length > 0 ? (
          <div className="space-y-3">
            {fullMedicalHistory.map((record: any, index: number) => (
              <TimelineAccordionCard key={record._id || index} record={record} />
            ))}

            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-5">
                <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--color-primary))] border-t-transparent animate-spin" />
              </div>
            )}
            {!hasMore && fullMedicalHistory.length > 3 && (
              <p className="text-center text-[12px] font-medium text-[hsl(var(--color-text-muted))] pt-3 border-t border-[hsl(var(--color-border))]">
                — End of history · {fullMedicalHistory.length} records —
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-14 border border-dashed border-[hsl(var(--color-border))] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--color-bg-surface-hover))] flex items-center justify-center mx-auto mb-3">
              <LuHistory className="text-[22px] text-[hsl(var(--color-text-muted))]" />
            </div>
            <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] mb-1">No medical history</p>
            <p className="text-[13px] text-[hsl(var(--color-text-muted))]">This appears to be the patient's first visit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
