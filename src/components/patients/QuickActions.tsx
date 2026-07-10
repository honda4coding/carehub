"use client";
import { LuDownload, LuFileText, LuPrinter, LuActivity } from "react-icons/lu";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--color-text))] mb-3">
        Patient Workspace Actions
      </h2>
      <Card className="p-4 flex flex-col gap-3 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300">
        <Link href="/patient/doctors" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all duration-300 hover:-translate-y-px flex items-center gap-3 text-left cursor-pointer group shadow-sm hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center text-lg">
            <LuFileText />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors tracking-tight">
              Book Appointment
            </p>
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5 font-medium">Find a doctor and book a visit</p>
          </div>
        </Link>

        <Link href="/patient/record/print" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all duration-300 hover:-translate-y-px flex items-center gap-3 text-left cursor-pointer group shadow-sm hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] flex items-center justify-center text-lg">
            <LuPrinter />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary-strong))] transition-colors tracking-tight">
              Print Medical Record
            </p>
            <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">
              Open high-contrast printable document
            </p>
          </div>
        </Link>
      </Card>
    </div>
  );
}
