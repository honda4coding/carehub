"use client";

import { LuCheck, LuBell } from "react-icons/lu";
import { Notification } from "./types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface Props {
  loading: boolean;
  filtered: Notification[];
  handleMarkAsRead: (id: string) => void;
}

export default function NotificationMobileList({
  loading,
  filtered,
  handleMarkAsRead,
}: Props) {
  const t = useTranslations("patient.NotificationsPage");
  if (loading || filtered.length === 0) {
    return null; // Handled by DesktopTable to avoid duplicate loading/empty states
  }

  return (
    <div className="lg:hidden flex flex-col gap-4 py-2">
      {filtered.map((notification) => (
        <div
          key={notification._id}
          className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <Badge variant={notification.isRead ? "info" : "warning"}>
              {notification.isRead ? t("read") : t("unread")}
            </Badge>
            <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
              {notification.type}
            </span>
          </div>
          <p className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-4 leading-tight">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--color-border-soft))]">
            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
            {!notification.isRead && (
              <Button
                size="sm"
                variant="outline"
                icon={LuCheck}
                onClick={() => handleMarkAsRead(notification._id)}
                className="text-[11px] px-3 py-1.5 min-h-0 h-auto"
              >
                {t("markRead")}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
