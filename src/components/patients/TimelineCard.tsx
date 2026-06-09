"use client";
import { LuPill } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";

interface Props {
  entry: TimelineEntry;
}

export default function TimelineCard({ entry }: Props) {
  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
      <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[hsl(var(--color-border-soft))] pb-3 mb-3">
        <div>
          <span className="text-[10px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">{entry.date}</span>
          <h3 className="text-[14px] font-black text-[hsl(var(--color-text))]">Encounter with {entry.doctorName}</h3>
          <p className="text-[10px] font-bold text-[hsl(var(--color-primary-strong))] uppercase tracking-wider">{entry.specialty}</p>
        </div>
        <div className="bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] text-[10px] font-black px-2.5 py-1 rounded-full">
          Chief Complaint: {entry.chiefComplaint}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase">Clinical Diagnosis</p>
          <p className="text-[12px] font-bold text-[hsl(var(--color-text))] mt-0.5">{entry.diagnosis}</p>
          <div className="mt-3">
            <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase">Doctor's Consultation Notes</p>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] leading-relaxed mt-0.5">{entry.clinicalNotes}</p>
          </div>
        </div>

        <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-3 border border-[hsl(var(--color-border-soft))]">
          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <LuPill className="text-xs" /> Issued Prescriptions:
          </p>
          {entry.prescriptions.length === 0 ? (
            <p className="text-[11px] text-[hsl(var(--color-text-muted))]">No prescriptions issued.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {entry.prescriptions.map((rx, idx) => (
                <div key={idx} className="bg-[hsl(var(--color-bg-surface))] rounded-lg p-2 border border-[hsl(var(--color-border-soft))] flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-[hsl(var(--color-text))]">{rx.medication}</p>
                    <p className="text-[9px] text-[hsl(var(--color-text-muted))] mt-0.5">Dosage: {rx.dosage}</p>
                  </div>
                  <span className="text-[9px] font-black bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] px-2 py-0.5 rounded">
                    {rx.frequency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
