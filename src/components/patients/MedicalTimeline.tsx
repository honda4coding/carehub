"use client";
import { LuClock, LuChevronRight } from "react-icons/lu";
import { TimelineEntry } from "@/types/patient";
import TimelineCard from "./TimelineCard";
import TimelineSkeleton from "./skeletons/TimelineSkeleton";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Props {
  entries: TimelineEntry[];
  loading: boolean;
  searchTerm: string;
}

export default function MedicalTimeline({ entries, loading, searchTerm }: Props) {
  const t = useTranslations("patient.MedicalTimeline");
  const displayedEntries = entries.slice(0, 3);

  return (
    <div className="xl:col-span-2">
      <h2 className="text-sm font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-5 flex items-center gap-1.5">
        <LuClock className="text-lg text-[hsl(var(--color-primary))]" /> {t("title")}
      </h2>

      {loading ? (
        <TimelineSkeleton />
      ) : entries.length === 0 ? (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center">
          <p className="text-sm text-[hsl(var(--color-text-muted))] font-bold">
            {searchTerm ? t("noMatch") : t("noRecords")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative ps-4 md:pl-8 border-s-2 border-[hsl(var(--color-border))] ms-3 md:ml-4 space-y-6">
            {displayedEntries.map((entry) => (
              <TimelineCard key={entry.id} entry={entry} />
            ))}
          </div>
          
          {entries.length > 3 && (
            <Link
              href="/patient/history"
              className="mt-2 w-full max-w-[220px] mx-auto flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] text-sm font-bold hover:bg-[hsl(var(--color-primary))] hover:text-white transition-colors group cursor-pointer"
            >
              {t("viewFullHistory", { count: entries.length })} <LuChevronRight className="text-base transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
