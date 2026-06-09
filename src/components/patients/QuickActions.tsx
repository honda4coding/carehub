"use client";
import { LuDownload, LuFileText, LuPrinter } from "react-icons/lu";
import Link from "next/link";

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3">
        Patient Workspace Actions
      </h2>
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col gap-3">
        <button className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-3 text-left cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] flex items-center justify-center text-sm">
            <LuDownload />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-black text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-success))] transition-colors">
              Download Health Record
            </p>
            <p className="text-[9px] text-[hsl(var(--color-text-muted))] mt-0.5">Get fully compiled PDF history</p>
          </div>
        </button>

        <Link href="/patient/record/print" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-3 text-left cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] flex items-center justify-center text-sm">
            <LuPrinter />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-black text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary-strong))] transition-colors">
              Print Medical Record
            </p>
            <p className="text-[9px] text-[hsl(var(--color-text-muted))] mt-0.5">
              Open high-contrast printable document
            </p>
          </div>
        </Link>

        <div className="mt-2 p-3 bg-[hsl(var(--color-bg-soft))] rounded-xl border border-[hsl(var(--color-border-soft))] flex items-start gap-2.5">
          <LuFileText className="text-base text-[hsl(var(--color-primary-strong))] mt-0.5" />
          <div>
            <p className="text-[10px] font-extrabold text-[hsl(var(--color-text))]">National ID Registration</p>
            <p className="text-[9px] text-[hsl(var(--color-text-muted))] leading-tight mt-0.5">
              Your profile is securely locked to National ID status to enforce absolute system integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
