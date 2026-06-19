"use client";
import { useState } from "react";
import { LuStethoscope, LuChevronDown, LuChevronUp } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";

interface Props {
  entry: TimelineEntry;
}

export default function TimelineCard({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative group w-full">
      {/* Timeline Node (Glowing Dot) */}
      <div className="absolute -left-[22px] md:-left-[38px] top-5 w-3.5 h-3.5 rounded-full bg-[hsl(var(--color-bg-surface))] border-[3px] border-[hsl(var(--color-primary))] shadow-[0_0_10px_hsl(var(--color-primary)/0.4)] group-hover:scale-125 group-hover:bg-[hsl(var(--color-primary))] transition-all duration-300 z-10" />

      {/* Card Content */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 md:p-5 shadow-sm group-hover:border-[hsl(var(--color-primary)/0.3)] group-hover:shadow-[0_4px_24px_hsl(var(--color-primary)/0.05)] transition-all duration-300 cursor-pointer"
      >
        
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2">
              {entry.date}
            </span>
            <h3 className="text-[14px] font-black text-[hsl(var(--color-text))] flex items-center gap-1.5">
              <LuStethoscope className="text-[hsl(var(--color-primary))] flex-shrink-0" /> Encounter with {entry.doctorName}
            </h3>
            <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase mt-1 tracking-wider">{entry.specialty} • {entry.diagnosis || "No diagnosis recorded"}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button className="text-[hsl(var(--color-text-muted))] p-1 rounded-md hover:bg-[hsl(var(--color-bg-soft))] transition-colors self-end mt-1">
              {expanded ? <LuChevronUp className="text-xl" /> : <LuChevronDown className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Expanded Area (MedicalHistoryCard) */}
        {expanded && entry.rawRecord && (
          <div 
            className="animate-in fade-in slide-in-from-top-2 duration-200 mt-4 cursor-auto border-t border-[hsl(var(--color-border-soft))] pt-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <MedicalHistoryCard record={entry.rawRecord} hideHeader={true} />
          </div>
        )}
        
        {/* Fallback if no rawRecord is attached (shouldn't happen but just in case) */}
        {expanded && !entry.rawRecord && (
           <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border-soft))] text-center text-sm text-[hsl(var(--color-text-muted))] italic">
              Detailed record not available.
           </div>
        )}
      </div>
    </div>
  );
}
