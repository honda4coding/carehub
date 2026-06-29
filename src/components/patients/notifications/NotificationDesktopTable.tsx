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

export default function NotificationDesktopTable({
  loading,
  filtered,
  handleMarkAsRead,
}: Props) {
  const t = useTranslations("patient.NotificationsPage");
  if (loading) {
    return (
      <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">
        {t("loading")}
      </p>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LuBell className="text-[28px] text-[hsl(var(--color-text-muted))]" />
        <p className="mt-2 text-[12px] text-[hsl(var(--color-text-muted))]">
          {t("noNotifications")}
        </p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[700px] hidden lg:table">
      <thead>
        <tr className="border-b border-[hsl(var(--color-border))]">
          <th className="pb-3 text-start text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            {t("colMessage")}
          </th>
          <th className="pb-3 text-start text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            {t("colType")}
          </th>
          <th className="pb-3 text-start text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            {t("colDate")}
          </th>
          <th className="pb-3 text-start text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            {t("colStatus")}
          </th>
          <th className="pb-3 text-center text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            {t("colActions")}
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((notification) => (
          <tr
            key={notification._id}
            className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            <td className="py-3.5 pe-4">
              <p className="text-[13px] font-medium text-[hsl(var(--color-text))]">
                {notification.message}
              </p>
            </td>
            <td className="py-3.5 pe-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
              {notification.type}
            </td>
            <td className="py-3.5 pe-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
              {new Date(notification.createdAt).toLocaleString()}
            </td>
            <td className="py-3.5 pe-4">
              <Badge variant={notification.isRead ? "info" : "warning"}>
                {notification.isRead ? t("read") : t("unread")}
              </Badge>
            </td>
            <td className="py-3.5">
              <div className="flex justify-center">
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={LuCheck}
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-[10px] px-2.5 py-1 min-h-0 h-auto"
                  >
                    {t("markRead")}
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
