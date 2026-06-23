"use client";

import { LuCheck, LuBell } from "react-icons/lu";
import { Notification } from "./types";

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
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                notification.isRead
                  ? "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]"
                  : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
              }`}
            >
              {notification.isRead ? "Read" : "Unread"}
            </span>
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
              <button
                onClick={() => handleMarkAsRead(notification._id)}
                className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-[8px] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all border border-[hsl(var(--color-primary)/0.2)] cursor-pointer"
              >
                <LuCheck className="text-[12px]" /> Mark Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
