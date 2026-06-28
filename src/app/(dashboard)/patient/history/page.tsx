"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuClipboardList, LuStethoscope, LuCalendar, LuChevronDown, LuChevronUp,
  LuFileText, LuHistory, LuPill, LuSearch, LuShieldAlert, LuActivity,
  LuScissors, LuHeartPulse, LuThermometer, LuDroplets, LuWeight,
  LuRuler, LuFlame, LuX, LuExternalLink, LuImage
} from "react-icons/lu";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import EmptyState from "@/components/appointments/EmptyState";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import DashboardHeader from "@/components/global/DashboardHeader";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
          <div className="flex gap-4 p-5">
            <div className="w-1 rounded-full bg-[hsl(var(--color-border))] self-stretch shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-[hsl(var(--color-border))] rounded-full w-24 mb-3" />
              <div className="h-4 bg-[hsl(var(--color-border))] rounded-full w-48 mb-2" />
              <div className="h-3 bg-[hsl(var(--color-border))] rounded-full w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Vital Chip ─────────────────────────────────────────────────────────── */
function VitalChip({ icon, label, value, highlight = false }: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  if (!value || value === "--") return null;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-colors
      ${highlight
        ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))]"
        : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
      }`}>
      <span className="text-[11px]">{icon}</span>
      <span className="text-[hsl(var(--color-text-muted))]">{label}</span>
      <span className={`font-semibold ${highlight ? "text-[hsl(var(--color-danger))]" : "text-[hsl(var(--color-text))]"}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── Tab Button ─────────────────────────────────────────────────────────── */
function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[13px] font-semibold transition-colors relative cursor-pointer
        ${active
          ? "text-[hsl(var(--color-primary))] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[hsl(var(--color-primary))] after:rounded-full"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
        }`}
    >
      {label}
    </button>
  );
}

/* ─── Visit Card ─────────────────────────────────────────────────────────── */
type Severity = "critical" | "warning" | "normal";

function getSeverity(record: any): Severity {
  const diag = (record.diagnosis || "").toLowerCase();
  if (diag.includes("crisis") || diag.includes("emergency") || diag.includes("acute") || diag.includes("severe"))
    return "critical";
  if (diag.includes("infection") || diag.includes("fever") || diag.includes("inflammation") || diag.includes("chronic"))
    return "warning";
  return "normal";
}

const SEVERITY_STYLES: Record<Severity, { bar: string; dot: string; badge: string }> = {
  critical: {
    bar: "bg-[hsl(var(--color-danger))]",
    dot: "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.3)] text-[hsl(var(--color-danger))]",
    badge: "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] border border-[hsl(var(--color-danger)/0.2)]",
  },
  warning: {
    bar: "bg-[hsl(var(--color-warning))]",
    dot: "bg-[hsl(var(--color-warning-bg))] border-[hsl(var(--color-warning)/0.3)] text-[hsl(var(--color-warning))]",
    badge: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] border border-[hsl(var(--color-warning)/0.2)]",
  },
  normal: {
    bar: "bg-[hsl(var(--color-primary))]",
    dot: "bg-[hsl(var(--color-primary)/0.1)] border-[hsl(var(--color-primary)/0.25)] text-[hsl(var(--color-primary))]",
    badge: "bg-[hsl(var(--color-primary)/0.08)] text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.2)]",
  },
};

type ExpandTab = "vitals" | "medications" | "notes" | "documents";

function VisitCard({ record }: { record: any }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ExpandTab>("vitals");

  const severity = getSeverity(record);
  const styles = SEVERITY_STYLES[severity];

  const dateStr = new Date(record.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const timeStr = new Date(record.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  const hasVitals = record.bloodPressure || record.sugarLevel || record.pulse || record.temperature || record.height || record.weight;
  const prescriptions = record.prescriptions || [];
  const documents = record.documents || [];
  const hasDocs = documents.length > 0;

  // Detect high fever for highlight
  const tempVal = parseFloat(record.temperature);
  const highTemp = !isNaN(tempVal) && tempVal >= 38;

  const tabs: { key: ExpandTab; label: string }[] = [
    { key: "vitals", label: "Vitals" },
    { key: "medications", label: "Medications" },
    { key: "notes", label: "Notes" },
    ...(hasDocs ? [{ key: "documents" as ExpandTab, label: "Documents" }] : []),
  ];

  return (
    <div
      className={`bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] overflow-hidden transition-all duration-200
        ${expanded ? "border-[hsl(var(--color-primary)/0.4)] shadow-sm" : "hover:border-[hsl(var(--color-border))]"}
      `}
    >
      {/* Clickable Header Row */}
      <div
        className="flex cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Severity accent bar */}
        <div className={`w-[3px] shrink-0 ${styles.bar} rounded-l-2xl`} />

        {/* Main info */}
        <div className="flex-1 px-5 py-4">
          {/* Top row: date + chevron */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-[12px] text-[hsl(var(--color-text-muted))] font-medium">
              <LuCalendar className="text-[11px]" />
              <span>{dateStr}</span>
              <span className="opacity-50">·</span>
              <span>{timeStr}</span>
            </div>
            <div className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${styles.badge}`}>
              {severity === "critical" ? "Critical" : severity === "warning" ? "Follow-up" : "Routine"}
            </div>
          </div>

          {/* Diagnosis */}
          <h3 className="text-[15px] font-semibold text-[hsl(var(--color-text))] mb-1.5 leading-snug">
            {record.diagnosis || "No diagnosis recorded"}
          </h3>

          {/* Doctor */}
          <p className="text-[13px] text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
            <LuStethoscope className="shrink-0 text-[12px]" />
            <span className="font-medium text-[hsl(var(--color-text))]">
              {record.doctorId?.fullName ?? record.doctorId?.userName ?? "Doctor"}
            </span>
            {record.doctorId?.specialization && (
              <span className="opacity-60">· {record.doctorId.specialization}</span>
            )}
          </p>

          {/* Inline vitals preview — always visible */}
          {hasVitals && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {record.bloodPressure && <VitalChip icon={<LuHeartPulse />} label="BP" value={record.bloodPressure} />}
              {record.pulse && <VitalChip icon={<LuActivity />} label="Pulse" value={`${record.pulse} bpm`} />}
              {record.temperature && <VitalChip icon={<LuThermometer />} label="Temp" value={`${record.temperature}°C`} highlight={highTemp} />}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="flex items-center pr-4 pl-1 text-[hsl(var(--color-text-muted))]">
          {expanded ? <LuChevronUp className="text-[16px]" /> : <LuChevronDown className="text-[16px]" />}
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="border-t border-[hsl(var(--color-border))] animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Tab Bar */}
          <div className="flex border-b border-[hsl(var(--color-border))] px-4">
            {tabs.map((t) => (
              <TabBtn
                key={t.key}
                label={t.label}
                active={activeTab === t.key}
                onClick={() => setActiveTab(t.key)}
              />
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* ── Vitals Tab ── */}
            {activeTab === "vitals" && (
              <div>
                {hasVitals ? (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { icon: <LuHeartPulse />, label: "Blood pressure", value: record.bloodPressure, unit: "mmHg" },
                      { icon: <LuDroplets />, label: "Sugar level", value: record.sugarLevel, unit: "mg/dL" },
                      { icon: <LuActivity />, label: "Pulse", value: record.pulse ? `${record.pulse}` : null, unit: "bpm" },
                      { icon: <LuThermometer />, label: "Temperature", value: record.temperature ? `${record.temperature}` : null, unit: "°C", highlight: highTemp },
                      { icon: <LuRuler />, label: "Height", value: record.height !== "-" ? record.height : null, unit: "cm" },
                      { icon: <LuWeight />, label: "Weight", value: record.weight !== "-" ? record.weight : null, unit: "kg" },
                    ].map((v, i) =>
                      v.value ? (
                        <div
                          key={i}
                          className={`rounded-xl p-3 border ${v.highlight
                            ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.15)]"
                            : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))]"
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 text-[11px] font-medium mb-1.5 ${v.highlight ? "text-[hsl(var(--color-danger))]" : "text-[hsl(var(--color-text-muted))]"}`}>
                            {v.icon} {v.label}
                          </div>
                          <div className={`text-[18px] font-semibold leading-none ${v.highlight ? "text-[hsl(var(--color-danger))]" : "text-[hsl(var(--color-text))]"}`}>
                            {v.value}
                            <span className="text-[12px] font-normal text-[hsl(var(--color-text-muted))] ml-1">{v.unit}</span>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] italic text-center py-4">No vitals recorded for this visit.</p>
                )}
              </div>
            )}

            {/* ── Medications Tab ── */}
            {activeTab === "medications" && (
              <div>
                {prescriptions.length > 0 ? (
                  <div className="space-y-2">
                    {prescriptions.map((rx: any) =>
                      rx.medications?.map((med: any, mIdx: number) => (
                        <div key={mIdx} className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
                          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-[hsl(var(--color-primary))] shrink-0 mt-0.5">
                            <LuPill className="text-[13px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] leading-tight">{med.medicineName}</p>
                            <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-0.5 font-medium">
                              {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {record.prescriptionText && (
                      <div className="mt-3 p-3 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Rx notes</p>
                        <p className="text-[13px] text-[hsl(var(--color-text))] leading-relaxed">{record.prescriptionText}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] italic text-center py-4">No medications prescribed in this visit.</p>
                )}
              </div>
            )}

            {/* ── Notes Tab ── */}
            {activeTab === "notes" && (
              <div>
                {record.notes ? (
                  <div className="p-4 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Symptoms &amp; notes</p>
                    <p className="text-[14px] text-[hsl(var(--color-text))] leading-relaxed">{record.notes}</p>
                  </div>
                ) : (
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] italic text-center py-4">No notes recorded for this visit.</p>
                )}

                {/* Alerts snapshot in notes tab */}
                {(record.allergies?.length > 0 || record.chronic?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {record.allergies?.length > 0 && (
                      <div className="p-3 rounded-xl bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.15)]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-danger)/0.8)] mb-1.5">Allergies</p>
                        <p className="text-[13px] text-[hsl(var(--color-text))] font-medium">{record.allergies.join(", ")}</p>
                      </div>
                    )}
                    {record.chronic?.length > 0 && (
                      <div className="p-3 rounded-xl bg-[hsl(var(--color-warning-bg))] border border-[hsl(var(--color-warning)/0.15)]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-warning)/0.8)] mb-1.5">Chronic</p>
                        <p className="text-[13px] text-[hsl(var(--color-text))] font-medium">{record.chronic.join(", ")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Documents Tab ── */}
            {activeTab === "documents" && (
              <div className="flex flex-wrap gap-2">
                {documents.map((doc: any, dIdx: number) => {
                  const isImage = ["prescription", "xray", "mri", "ct"].includes(doc.type);
                  return (
                    <a
                      key={dIdx}
                      href={doc.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold
                        bg-[hsl(var(--color-primary)/0.06)] text-[hsl(var(--color-primary-strong))]
                        border border-[hsl(var(--color-primary)/0.15)] hover:bg-[hsl(var(--color-primary)/0.12)]
                        transition-colors"
                    >
                      {isImage ? <LuImage className="text-[13px]" /> : <LuFileText className="text-[13px]" />}
                      {doc.title || "Document"}
                      <LuExternalLink className="text-[11px] opacity-60" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Health Snapshot Banner ─────────────────────────────────────────────── */
function HealthSnapshot({ allergies, chronicDiseases, surgeries }: {
  allergies: string[]; chronicDiseases: string[]; surgeries: string[];
}) {
  const hasAny = allergies.length > 0 || chronicDiseases.length > 0 || surgeries.length > 0;
  if (!hasAny) return null;

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 overflow-x-auto">
      <div className="flex flex-nowrap sm:flex-wrap gap-2 items-center min-w-max sm:min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] shrink-0 pr-2 border-r border-[hsl(var(--color-border))]">
          Health alerts
        </span>

        {allergies.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
            bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] border border-[hsl(var(--color-danger)/0.2)]">
            <LuShieldAlert className="text-[11px]" /> {a}
          </span>
        ))}

        {chronicDiseases.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
            bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] border border-[hsl(var(--color-warning)/0.2)]">
            <LuActivity className="text-[11px]" /> {c}
          </span>
        ))}

        {surgeries.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
            bg-[hsl(var(--color-primary)/0.08)] text-[hsl(var(--color-primary-strong))] border border-[hsl(var(--color-primary)/0.15)]">
            <LuScissors className="text-[11px]" /> {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Medications Sidebar (shared content) ───────────────────────────────── */
function MedicationsSidebar({ medications, loading }: { medications: any[]; loading: boolean }) {
  const [search, setSearch] = useState("");
  const activeMeds = medications.filter(m => m.status === "active");
  const pastMeds = medications.filter(m => m.status !== "active").filter(m =>
    !search || m.medicineName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-[hsl(var(--color-border))] rounded-xl" />
      ))}
    </div>
  );

  if (medications.length === 0) return (
    <p className="text-[13px] text-[hsl(var(--color-text-muted))] text-center py-8 italic">
      No medications on record.
    </p>
  );

  const MedRow = ({ med, isActive }: { med: any; isActive: boolean }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors
      ${isActive
        ? "bg-[hsl(var(--color-success-bg))] border-[hsl(var(--color-success)/0.2)]"
        : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))]"
      }`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isActive ? "bg-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-text-muted))]"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-[hsl(var(--color-text))] truncate">{med.medicineName}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0
            ${isActive
              ? "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]"
              : "text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-border))]"
            }`}>
            {isActive ? "Active" : "Past"}
          </span>
        </div>
        <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium">
          {med.dosage} · {med.frequency}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {activeMeds.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5">
            Active ({activeMeds.length})
          </p>
          <div className="space-y-2">
            {activeMeds.map((m, i) => <MedRow key={i} med={m} isActive={true} />)}
          </div>
        </div>
      )}

      {pastMeds.length > 0 || search ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5">
            Past medications
          </p>
          <div className="relative mb-2.5">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] font-medium rounded-xl border border-[hsl(var(--color-border))]
                bg-[hsl(var(--color-bg-surface-hover))] outline-none text-[hsl(var(--color-text))]
                focus:border-[hsl(var(--color-primary))] transition-colors
                placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] cursor-pointer hover:text-[hsl(var(--color-text))]">
                <LuX className="text-[12px]" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {pastMeds.map((m, i) => <MedRow key={i} med={m} isActive={false} />)}
          </div>
          {pastMeds.length === 0 && search && (
            <p className="text-[12px] text-[hsl(var(--color-text-muted))] text-center py-4 italic">No results for "{search}"</p>
          )}
        </div>
      ) : null}
    </div>
  );
}


/* ─── Mobile Medications Panel ───────────────────────────────────────────── */
function MobileMedicationsPanel({ medications, loading }: { medications: any[]; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const activeMeds = medications.filter(m => m.status === "active");
  return (
    <div className="lg:hidden border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <span className="text-[13px] font-semibold text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuPill className="text-[hsl(var(--color-primary))] text-[14px]" />
          Medications
          {activeMeds.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]">
              {activeMeds.length} active
            </span>
          )}
        </span>
        {open ? <LuChevronUp className="text-[14px] text-[hsl(var(--color-text-muted))]" /> : <LuChevronDown className="text-[14px] text-[hsl(var(--color-text-muted))]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <MedicationsSidebar medications={medications} loading={loading} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; variant: "success" | "error" } | null>(null);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
  const [surgeries, setSurgeries] = useState<string[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");

  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;

    async function fetchAll() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/patient/profile`, { headers: authHeaders() });
        const p = data.data ?? data;
        setAllergies(p.allergies ?? []);
        setChronicDiseases(p.chronic ?? p.chronicDiseases ?? []);
        setSurgeries((p.surgeries ?? []).map((s: any) => typeof s === "string" ? s : s.operationName || ""));
      } catch {}

      try {
        const { data } = await axios.get(`${BASE_URL}/medical-history/${patientId}`, { headers: authHeaders() });
        const result = data.data ?? data;
        const fetched = Array.isArray(result) ? result : result ? [result] : [];
        setRecords(fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch {
        setToast({ msg: "Failed to load medical history", variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [user]);

  const filteredRecords = records.filter(r => {
    const q = filterText.toLowerCase();
    const docName = (r.doctorId?.fullName || r.doctorId?.userName || "").toLowerCase();
    const specialty = (r.doctorId?.specialization || "").toLowerCase();
    const diag = (r.diagnosis || "").toLowerCase();
    const meds = (r.prescriptions || []).map((p: any) => (p.medication || p.name || "").toLowerCase()).join(" ");
    const matchText = docName.includes(q) || specialty.includes(q) || diag.includes(q) || meds.includes(q);

    const recDate = new Date(r.createdAt); recDate.setHours(0,0,0,0);
    let matchStart = true, matchEnd = true;
    if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); matchStart = recDate >= s; }
    if (endDate) { const e = new Date(endDate); e.setHours(0,0,0,0); matchEnd = recDate <= e; }
    return matchText && matchStart && matchEnd;
  });

  useEffect(() => { setVisibleCount(10); }, [filterText, startDate, endDate]);

  const displayedRecords = filteredRecords.slice(0, visibleCount);
  const hasMoreRecords = visibleCount < filteredRecords.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMoreRecords) setVisibleCount(p => p + 10); },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [hasMoreRecords]);

  const allMedications = useMemo(() => {
    const meds = new Map();
    records.forEach(r => {
      (r.prescriptions || []).forEach((rx: any) => {
        const rxDate = new Date(rx.createdAt || r.createdAt);
        (rx.medications || []).forEach((m: any) => {
          const key = m.medicineName.toLowerCase();
          if (!meds.has(key) || rxDate > meds.get(key).date) {
            meds.set(key, { ...m, date: rxDate, prescriptionId: rx._id, status: rx.status || "completed" });
          }
        });
      });
    });
    return Array.from(meds.values()).sort((a: any, b: any) => b.date - a.date);
  }, [records]);

  const clearFilters = () => { setStartDate(""); setEndDate(""); setFilterText(""); };
  const hasFilters = startDate || endDate || filterText;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      {toast && <AppointmentToast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}

      <DashboardHeader
        title="Medical History"
        subtitle="Your complete clinical encounter records"
        backPath="/patient"
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[hsl(var(--color-bg-base))]">
        <div className="max-w-7xl mx-auto w-full">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
          
          {/* Filters Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-6">
            <h3 className="text-[17px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
              <LuHistory className="text-[hsl(var(--color-text-muted))] text-[20px]" /> Full Medical History
            </h3>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-end sm:items-center gap-3 w-full xl:w-auto">
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onReset={(startDate || endDate) ? () => { setStartDate(""); setEndDate(""); } : undefined}
                className="!mt-0"
              />
              {filterText && (
                <button onClick={() => setFilterText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] cursor-pointer">
                  <LuX className="text-[13px]" />
                </button>
              )}
            </div>
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onReset={hasFilters ? clearFilters : undefined}
              className="!mt-0"
            />
          </div>

          {/* Record count */}
          {!loading && records.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium">
                {hasFilters
                  ? `${filteredRecords.length} of ${records.length} visits`
                  : `${records.length} visit${records.length !== 1 ? "s" : ""} total`
                }
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[12px] font-semibold text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Timeline list */}
          {loading ? (
            <Skeleton />
          ) : records.length === 0 ? (
            <EmptyState
              icon={<LuHistory />}
              title="No medical history"
              description="You have no recorded visits or diagnoses yet."
            />
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16 bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))]">
              <p className="text-[14px] font-semibold text-[hsl(var(--color-text-muted))] mb-3">No records match your filters.</p>
              <button onClick={clearFilters} className="text-[13px] font-semibold text-[hsl(var(--color-primary))] hover:underline cursor-pointer">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRecords.map(r => (
                <VisitCard key={r._id} record={r} />
              ))}

              {/* Infinite scroll trigger */}
              {hasMoreRecords && (
                <div ref={observerTarget} className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* End of list */}
              {!hasMoreRecords && filteredRecords.length > 4 && (
                <div className="text-center py-5 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
                  — End of history · {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} —
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
