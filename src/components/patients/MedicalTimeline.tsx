"use client";
import { useState } from "react";
import { LuClock, LuChevronDown, LuChevronUp } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";
import TimelineCard from "./TimelineCard";
import TimelineSkeleton from "./skeletons/TimelineSkeleton";

interface Props {
  entries: TimelineEntry[];
  loading: boolean;
  searchTerm: string;
}

export default function MedicalTimeline({ entries, loading, searchTerm }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedEntries = isExpanded ? entries : entries.slice(0, 3);

  return (
    <div className="xl:col-span-2">
      <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-5 flex items-center gap-1.5">
        <LuClock className="text-[14px] text-[hsl(var(--color-primary))]" /> Medical Timeline
      </h2>

      {loading ? (
        <TimelineSkeleton />
      ) : entries.length === 0 ? (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[13px] text-[hsl(var(--color-text-muted))] font-bold">
            {searchTerm ? "No encounters matched your search filters." : "No medical records found."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative pl-4 md:pl-8 border-l-2 border-[hsl(var(--color-border))] ml-3 md:ml-4 space-y-6">
            {displayedEntries.map((entry) => (
              <TimelineCard key={entry.id} entry={entry} />
            ))}
          </div>
          
          {entries.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 w-full max-w-[200px] mx-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] text-[11px] font-bold hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
            >
              {isExpanded ? (
                <>Show Less <LuChevronUp /></>
              ) : (
                <>View All Records ({entries.length}) <LuChevronDown /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
