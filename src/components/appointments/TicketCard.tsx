import type { ReactNode } from "react";
import type { DisplayStatus } from "@/services/appointmentService";
import StatusBadge from "./StatusBadge";

export default function TicketCard({
  date,
  timeLabel,
  avatarInitials,
  avatarClassName = "bg-primary",
  title,
  subtitle,
  status,
  actions,
}: {
  date: Date;
  timeLabel: string;
  avatarInitials: string;
  avatarClassName?: string;
  title: string;
  subtitle: string;
  status: DisplayStatus;
  actions?: ReactNode;
}) {
  const dimmed = status === "cancelled";

  return (
    <div
      className={`relative flex bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl  overflow-hidden mb-3   ${
        dimmed ? "opacity-70" : ""
      }`}
    >
      {/* Date stub */}
      <div
        className={`relative w-[88px] sm:w-[100px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-3 border-r-2 border-dashed border-[hsl(var(--color-border-soft))] ${
          dimmed
            ? "bg-[hsl(var(--color-bg-soft))]"
            : "bg-[hsl(var(--color-primary)/0.08)]"
        }`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-primary"
          }`}
        >
          {date.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span
          className={`text-[26px] font-black leading-none ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-text))]"
          }`}
        >
          {date.getDate()}
        </span>
        <span
          className={`text-[10px] font-bold mt-0.5 ${
            dimmed ? "text-[hsl(var(--color-text-muted))]" : "text-primary"
          }`}
        >
          {timeLabel}
        </span>

        {/* punch-hole notches */}
        <span className="absolute -right-[7px] -top-[7px] w-3.5 h-3.5 rounded-full bg-[hsl(var(--color-bg))]" />
        <span className="absolute -right-[7px] -bottom-[7px] w-3.5 h-3.5 rounded-full bg-[hsl(var(--color-bg))]" />
      </div>

      {/* Body */}
      <div className="flex-1 p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-black shrink-0 ${avatarClassName}`}
          >
            {avatarInitials}
          </div>
          <div className="min-w-0">
            <p
              className={`text-[14px] font-bold truncate ${
                dimmed
                  ? "text-[hsl(var(--color-text-muted))] line-through"
                  : "text-[hsl(var(--color-text))]"
              }`}
            >
              {title}
            </p>
            <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] truncate">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} />
          {actions}
        </div>
      </div>
    </div>
  );
}
