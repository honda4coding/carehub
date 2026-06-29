import { Card } from "@/components/ui/Card";
import React from "react";
import { useRouter } from "next/navigation";
import { LuClock, LuUserPlus, LuStethoscope, LuFileText, LuShieldCheck } from "react-icons/lu";

export interface Activity {
  _id: string;
  message: string;
  createdAt: string;
  type?: string;
}

export interface ActivityFeedProps {
  activities: Activity[];
  loading: boolean;
  className?: string;
}

/* Format ISO date string as a short time, e.g. "2 min ago", "Yesterday" */
function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just Now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function getActivityConfig(type?: string) {
  const str = (type || "").toLowerCase();
  if (str.includes("register")) {
    return {
      icon: <LuUserPlus className="text-[14px]" />,
      style: "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]",
    };
  }
  if (str.includes("license")) {
    return {
      icon: <LuFileText className="text-[14px]" />,
      style: "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
    };
  }
  if (str.includes("approv")) {
    return {
      icon: <LuShieldCheck className="text-[14px]" />,
      style: "bg-[hsl(var(--color-success)/0.15)] text-[hsl(var(--color-success))]",
    };
  }
  if (str.includes("doctor")) {
    return {
      icon: <LuStethoscope className="text-[14px]" />,
      style: "bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary-strong))]",
    };
  }
  return {
    icon: <LuClock className="text-[14px]" />,
    style: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
  };
}

export function ActivityFeed({ activities, loading, className = "" }: ActivityFeedProps) {
  const router = useRouter();

  return (
    <Card className={`p-6 flex flex-col h-full border border-[hsl(var(--color-border-soft))] shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] md:text-[18px] font-bold text-[hsl(var(--color-text))]">
          Recent Activity
        </h3>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto pe-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
              Loading activities...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 3).map((n, i) => {
              const conf = getActivityConfig(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => router.push("/admin/notifications")}
                  className="group flex gap-4 p-3 rounded-[12px] hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer"
                >
                  <div
                    className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 shadow-sm ${conf.style}`}
                  >
                    {conf.icon}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[13px] font-bold text-[hsl(var(--color-text))] leading-tight mb-1 group-hover:text-[hsl(var(--color-primary))] transition-colors">
                      {n.message}
                    </p>
                    <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] flex items-center gap-1.5">
                      <LuClock className="text-[10px]" />
                      {formatRelativeTime(n.createdAt)}
                      {n.type ? ` · ${n.type}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
