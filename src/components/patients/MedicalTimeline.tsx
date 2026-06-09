"use client";
import { LuClock } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";
import TimelineCard from "./TimelineCard";
import TimelineSkeleton from "./skeletons/TimelineSkeleton";

interface Props {
  entries: TimelineEntry[];
  loading: boolean;
  searchTerm: string;
}

export default function MedicalTimeline({ entries, loading, searchTerm }: Props) {
  return (
    <div className="xl:col-span-2">
      <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3 flex items-center gap-1.5">
        <LuClock className="text-[14px]" /> The Medical Timeline
      </h2>

      {loading ? (
        <TimelineSkeleton />
      ) : entries.length === 0 ? (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[hsl(var(--color-text-muted))] font-bold">
            {searchTerm ? "No encounters matched your search filters." : "No medical records found."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <TimelineCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
