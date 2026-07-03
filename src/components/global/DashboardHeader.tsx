"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LuChevronLeft, LuZap } from "react-icons/lu";
import ThemeToggle from "@/components/ThemeToggle";
import ClinicSelector from "@/components/doctor/ClinicSelector";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface DashboardHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  backPath?: string;
  rightElement?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  backPath,
  rightElement,
}: DashboardHeaderProps) {
  const router = useRouter();

  const { role, user } = useAuth();
  
  let planName = user?.subscriptionPlan || "Free";
  if (planName.toLowerCase().endsWith("plan")) {
    planName = planName.substring(0, planName.length - 4).trim();
  }
  const isFree = planName.toLowerCase().includes("free");

  return (
    <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3 md:gap-4 z-40 sticky top-0 shrink-0">
      <div className="flex items-center gap-3 md:gap-4 min-w-0 pl-11 md:pl-0 flex-1 md:flex-none">
        {backPath && (
          <button
            onClick={() => router.push(backPath)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-primary))] hover:text-white text-[hsl(var(--color-text-muted))] transition-colors border border-[hsl(var(--color-border))] shrink-0"
          >
            <LuChevronLeft className="text-xl" />
          </button>
        )}
        <div className="min-w-0">
          {typeof title === "string" ? (
            <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] truncate">
              {title}
            </h1>
          ) : (
            title
          )}
          {subtitle && (
            <p className="text-[11px] md:text-[12px] font-semibold text-[hsl(var(--color-text-muted))] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-auto max-w-full overflow-visible pb-1 md:pb-0">
        {role === "doctor" && (
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
              {planName} Plan
            </span>
            {isFree && (
              <Link
                href="/doctor/settings/subscription"
                className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.25)] transition-colors"
              >
                <LuZap className="text-[12px]" />
                Upgrade
              </Link>
            )}
          </div>
        )}
        {(role === "doctor" || role === "assistant") && <ClinicSelector />}
        <ThemeToggle />
        {rightElement && (
          <div className="flex items-center gap-2">
            {rightElement}
          </div>
        )}
      </div>
    </header>
  );
}
