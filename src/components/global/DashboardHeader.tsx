"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LuChevronLeft, LuZap, LuRefreshCw } from "react-icons/lu";
import ThemeToggle from "@/components/ThemeToggle";
import ClinicSelector from "@/components/doctor/ClinicSelector";
import NotificationBell from "@/components/global/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface DashboardHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  backPath?: string;
  showBack?: boolean;
  onRefresh?: () => void;
  rightElement?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  backPath,
  showBack,
  onRefresh,
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
    <header className="bg-[hsl(var(--color-bg-surface))/85] backdrop-blur-2xl px-5 md:px-8 min-h-[76px] py-3 flex items-center justify-between gap-4 z-40 sticky top-0 shrink-0">
      <div className="flex items-center gap-4 min-w-0 pl-11 md:pl-0 flex-1 md:flex-none">
        {(backPath || showBack) && (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-all duration-200 border border-[hsl(var(--color-border))] shrink-0 active:scale-95"
          >
            <LuChevronLeft className="text-xl" />
          </button>
        )}
        <div className="min-w-0">
          {typeof title === "string" ? (
            <h1 className="text-lg md:text-xl font-semibold text-[hsl(var(--color-text))] tracking-tight truncate">
              {title}
            </h1>
          ) : (
            title
          )}
          {subtitle && (
            <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 w-auto">
        {role === "doctor" && (
          <div className="hidden md:flex items-center gap-2 mr-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
              <span className="hidden lg:inline">{planName} Plan</span>
              <span className="inline lg:hidden">{planName}</span>
            </span>
            {isFree && (
              <Link
                href="/doctor/settings/subscription"
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary-strong))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all shadow-[var(--shadow-card)]"
              >
                <LuZap className="text-[12px]" />
                Upgrade
              </Link>
            )}
          </div>
        )}
        <ThemeToggle />
        {role !== 'assistant' && (
          <NotificationBell basePath={`/${role}`} />
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            <LuRefreshCw className="text-[15px]" />
          </button>
        )}
        {rightElement && (
          <div className="flex items-center gap-3 ml-2">
            {rightElement}
          </div>
        )}
      </div>
    </header>
  );
}
