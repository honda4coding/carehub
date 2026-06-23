"use client";

import { LuCheck, LuBell } from "react-icons/lu";
import { Notification } from "./types";

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
  if (loading) {
    return (
      <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">
        Loading...
      </p>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LuBell className="text-[28px] text-[hsl(var(--color-text-muted))]" />
        <p className="mt-2 text-[12px] text-[hsl(var(--color-text-muted))]">
          No notifications found
        </p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[700px] hidden lg:table">
      <thead>
        <tr className="border-b border-[hsl(var(--color-border))]">
          <th className="pb-3 text-left text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            Message
          </th>
          <th className="pb-3 text-left text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            Type
          </th>
          <th className="pb-3 text-left text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            Date
          </th>
          <th className="pb-3 text-left text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            Status
          </th>
          <th className="pb-3 text-center text-[10px] font-black uppercase tracking-[.07em] text-[hsl(var(--color-text-muted))]">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((notification) => (
          <tr
            key={notification._id}
            className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            <td className="py-3.5 pr-4">
              <p className="text-[13px] font-medium text-[hsl(var(--color-text))]">
                {notification.message}
              </p>
            </td>
            <td className="py-3.5 pr-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
              {notification.type}
            </td>
            <td className="py-3.5 pr-4 text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">
              {new Date(notification.createdAt).toLocaleString()}
            </td>
            <td className="py-3.5 pr-4">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                  notification.isRead
                    ? "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]"
                    : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                }`}
              >
                {notification.isRead ? "Read" : "Unread"}
              </span>
            </td>
            <td className="py-3.5">
              <div className="flex justify-center">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-[7px] border border-[hsl(var(--color-primary)/0.4)] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all cursor-pointer"
                  >
                    <LuCheck className="text-[11px]" />
                    Mark Read
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
