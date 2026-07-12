"use client";

import React, { useState } from "react";
import {
  LuStethoscope,
  LuCalendar,
  LuChevronDown,
  LuHeartPulse,
  LuDroplets,
  LuActivity,
  LuThermometer,
  LuRuler,
  LuWeight,
  LuPill,
  LuImage,
  LuFileText,
  LuExternalLink,
} from "react-icons/lu";
import { DocumentModal } from "@/components/shared/DocumentModal";

/* ─── Shared Components & Helpers ─── */
function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`px-4 py-3 text-[13px] font-semibold transition-colors relative cursor-pointer
        ${active
          ? "text-[hsl(var(--color-primary))] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[hsl(var(--color-primary))] after:rounded-full"
          : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
        }`}
    >
      {label}
    </button>
  );
}

export type Severity = "critical" | "warning" | "normal";

export function getSeverity(record: any): Severity {
  const diag = (record.diagnosis || "").toLowerCase();
  if (diag.includes("crisis") || diag.includes("emergency") || diag.includes("acute") || diag.includes("severe"))
    return "critical";
  if (diag.includes("infection") || diag.includes("fever") || diag.includes("inflammation") || diag.includes("chronic"))
    return "warning";
  return "normal";
}

export const SEVERITY_STYLES: Record<Severity, { bar: string; dot: string; badge: string }> = {
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

type ExpandTab = "diagnosis" | "vitals" | "medications" | "notes" | "documents";

/* ─── Visit Card ─────────────────────────────────────────────────────────── */
export default function VisitCard({ record, index, defaultExpanded = false, printMode = false }: { record: any; index: number; defaultExpanded?: boolean; printMode?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded || printMode);
  const [activeTab, setActiveTab] = useState<ExpandTab>("diagnosis");
  const [docModalUrl, setDocModalUrl] = useState<string | null>(null);

  const severity = getSeverity(record);
  const styles = SEVERITY_STYLES[severity];

  const dateObj = new Date(record.createdAt);
  const monthStr = dateObj.toLocaleDateString("en-US", { month: "short" });
  const dayStr = dateObj.toLocaleDateString("en-US", { day: "2-digit" });
  const yearStr = dateObj.getFullYear();
  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const hasVitals = record.bloodPressure || record.sugarLevel || record.pulse || record.temperature || record.height || record.weight;
  const prescriptions = record.prescriptions || [];
  const documents = record.documents || [];
  const hasDocs = documents.length > 0;

  // Detect high fever for highlight
  const tempVal = parseFloat(record.temperature);
  const highTemp = !isNaN(tempVal) && tempVal >= 38;

  const tabs: { key: ExpandTab; label: string }[] = [
    { key: "diagnosis", label: "Diagnosis & Symptoms" },
    { key: "vitals", label: "Vitals" },
    { key: "medications", label: "Medications" },
    { key: "notes", label: "Notes" },
    ...(hasDocs ? [{ key: "documents" as ExpandTab, label: "Documents" }] : []),
  ];

  return (
    <div
      className={`bg-[hsl(var(--color-bg-base))] rounded-2xl border transition-all duration-300 overflow-hidden group
        ${expanded ? "border-[hsl(var(--color-primary)/0.5)] shadow-[var(--shadow-card)]" : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.3)] hover:shadow-sm"}
      `}
    >
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center relative ${printMode ? '' : 'cursor-pointer select-none'}`}
        onClick={() => { if (!printMode) setExpanded(!expanded) }}
      >
        {/* Severity indicator line */}
        <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${severity !== 'normal' ? styles.bar : 'bg-[hsl(var(--color-primary)/0.3)]'} rounded-l-2xl`} />

        {/* Main Info Block */}
        <div className="flex-1 min-w-0 px-5 py-5 flex flex-col justify-center pl-6">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <h3 className={`text-[16.5px] font-bold tracking-tight text-[hsl(var(--color-text))] leading-snug ${expanded ? '' : 'line-clamp-2'}`}>
              {record.diagnosis || "General Consultation"}
            </h3>
            {severity !== "normal" && (
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${styles.badge}`}>
                {severity === "critical" ? "Critical" : "Follow-up"}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-[13.5px] font-medium text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
              <LuStethoscope className="text-[15px] text-[hsl(var(--color-primary))] shrink-0" />
              <span className="text-[hsl(var(--color-text))] truncate">{record.doctorId?.fullName ?? record.doctorId?.userName ?? "Doctor"}</span>
              {record.doctorId?.specialization && (
                <span className="hidden sm:inline opacity-70">
                  ({record.doctorId.specialization.replace(/_/g, " ")})
                </span>
              )}
            </p>
            <p className="text-[12.5px] font-medium text-[hsl(var(--color-text-muted))] flex items-center gap-1.5 flex-wrap">
              <LuCalendar className="text-[14px] shrink-0" />
              <span>{monthStr} {dayStr}, {yearStr}</span>
              <span className="opacity-50">·</span>
              <span>{timeStr}</span>
              {(() => {
                let ageAtVisit = null;
                const visitDate = new Date(record.createdAt);
                
                if (record.patientId?.dateOfBirth) {
                  const dob = new Date(record.patientId.dateOfBirth);
                  ageAtVisit = visitDate.getFullYear() - dob.getFullYear();
                  const m = visitDate.getMonth() - dob.getMonth();
                  if (m < 0 || (m === 0 && visitDate.getDate() < dob.getDate())) ageAtVisit--;
                } else if (record.patientId?.age) {
                  // Fallback if patient only has static 'age' in DB (no DOB)
                  const currentAge = record.patientId.age;
                  const currentYear = new Date().getFullYear();
                  ageAtVisit = currentAge - (currentYear - visitDate.getFullYear());
                } else if (record.patientAge) {
                   ageAtVisit = record.patientAge;
                }

                if (ageAtVisit === null || ageAtVisit < 0 || isNaN(ageAtVisit)) return null;
                return (
                  <>
                    <span className="opacity-50">·</span>
                    <span className="font-semibold text-[hsl(var(--color-primary-strong))]">Age: {ageAtVisit}</span>
                  </>
                );
              })()}
            </p>
          </div>
        </div>

        {!printMode && (
          <div className="px-5 py-4 flex flex-wrap items-center justify-end gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-[hsl(var(--color-border))]">
            <div className={`w-9 h-9 flex items-center justify-center transition-colors shrink-0 text-[hsl(var(--color-text-muted))] group-hover:text-[hsl(var(--color-primary))]`}>
              <LuChevronDown className={`text-[22px] transition-transform duration-300 ${expanded ? 'rotate-180 text-[hsl(var(--color-primary))]' : ''}`} />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="border-t border-dashed border-[hsl(var(--color-border))] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Tab Bar - Clean Line Style */}
          {!printMode && (
            <div className="px-2 overflow-x-auto scrollbar-hide border-b border-[hsl(var(--color-border))]">
              <div className="flex">
                {tabs.map((t) => (
                  <TabBtn
                    key={t.key}
                    label={t.label}
                    active={activeTab === t.key}
                    onClick={() => setActiveTab(t.key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className={`px-5 pb-5 pt-4 ${printMode ? 'space-y-6' : ''}`}>
            
            {/* ── Diagnosis & Symptoms Tab ── */}
            {(printMode || activeTab === "diagnosis") && (
              <div className="space-y-4">
                {printMode && <h4 className="text-[12px] font-black uppercase tracking-widest text-[hsl(var(--color-primary))] border-b border-[hsl(var(--color-border))] pb-1 mb-3">Diagnosis & Symptoms</h4>}
                <div className="p-4 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-primary))] mb-2 flex items-center gap-1.5">
                    <LuStethoscope className="text-[14px]" /> Diagnosis
                  </p>
                  <p className="text-[14.5px] font-semibold text-[hsl(var(--color-text))] leading-relaxed">{record.diagnosis || "No diagnosis recorded for this visit."}</p>
                </div>

                {record.notes && (
                  <div className="p-4 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                      Symptoms
                    </p>
                    <p className="text-[13.5px] text-[hsl(var(--color-text))] leading-relaxed whitespace-pre-wrap">{record.notes}</p>
                  </div>
                )}
                
                {(!record.diagnosis && !record.notes) && (
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] italic text-center py-2">No diagnosis or specific symptoms recorded.</p>
                )}
              </div>
            )}

            {/* ── Vitals Tab ── */}
            {(printMode || activeTab === "vitals") && (
              <div>
                {printMode && <h4 className="text-[12px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))] pb-1 mb-3 mt-2">Vitals</h4>}
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
            {(printMode || activeTab === "medications") && (
              <div>
                {printMode && <h4 className="text-[12px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))] pb-1 mb-3 mt-2">Medications</h4>}
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
            {(printMode || activeTab === "notes") && (
              <div>
                {printMode && <h4 className="text-[12px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))] pb-1 mb-3 mt-2">Notes & Alerts</h4>}
                {record.notes ? (
                  <div className="p-4 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Doctor's Notes</p>
                    <p className="text-[14px] text-[hsl(var(--color-text))] leading-relaxed">{record.notes}</p>
                  </div>
                ) : (
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] italic text-center py-4">No notes recorded for this visit.</p>
                )}

                {/* Alerts snapshot in notes tab */}
                {(record.allergies?.length > 0 || record.chronic?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
            {(printMode || activeTab === "documents") && (
              <div>
                {printMode && hasDocs && <h4 className="text-[12px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] border-b border-[hsl(var(--color-border))] pb-1 mb-3 mt-2">Documents</h4>}
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc: any, dIdx: number) => {
                    const isImage = ["prescription", "xray", "mri", "ct"].includes(doc.type);
                    return (
                      <button
                        key={dIdx}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDocModalUrl(doc.secure_url);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold
                          bg-[hsl(var(--color-primary)/0.06)] text-[hsl(var(--color-primary-strong))]
                          border border-[hsl(var(--color-primary)/0.15)] hover:bg-[hsl(var(--color-primary)/0.12)]
                          transition-colors cursor-pointer text-left"
                      >
                        {isImage ? <LuImage className="text-[13px]" /> : <LuFileText className="text-[13px]" />}
                        {doc.title || "Document"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentModal 
        url={docModalUrl} 
        onClose={() => setDocModalUrl(null)} 
        title="View Document"
      />
    </div>
  );
}
