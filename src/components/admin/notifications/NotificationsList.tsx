import React from "react";
import { LuBell, LuCheck } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  handleMarkAsRead: (id: string) => void;
}

export default function NotificationsList({
  notifications,
  loading,
  handleMarkAsRead,
}: NotificationsListProps) {
  if (loading) {
    return (
      <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">
        Loading...
      </p>
    );
  }

  if (notifications.length === 0) {
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
    <div className="overflow-x-auto -mx-4 px-4">
      {/* Desktop Table */}
      <table className="w-full min-w-[700px] hidden lg:table">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {["Message", "Type", "Date", "Status", "Actions"].map((h) => (
              <th
                key={h}
                className="pb-3 text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] text-start pe-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {notifications.map((notification) => (
            <tr
              key={notification._id}
              className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
            >
              <td className="py-3.5 pe-4 text-start">
                <p className="text-[13px] font-bold text-[hsl(var(--color-text))] leading-tight">
                  {notification.message}
                </p>
              </td>

              <td className="py-3.5 pe-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] text-start whitespace-nowrap">
                {notification.type}
              </td>

              <td className="py-3.5 pe-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] text-start whitespace-nowrap">
                {new Date(notification.createdAt).toLocaleDateString()}
              </td>

              <td className="py-3.5 pe-4 text-start">
                <Badge variant={notification.isRead ? "success" : "warning"}>
                  {notification.isRead ? "Read" : "Unread"}
                </Badge>
              </td>

              <td className="py-3.5 pe-4">
                <div className="flex justify-start">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      icon={LuCheck}
                      className="!text-[11px] !px-3 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)] cursor-pointer"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="lg:hidden flex flex-col gap-4 py-2">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <Badge variant={notification.isRead ? "success" : "warning"}>
                {notification.isRead ? "Read" : "Unread"}
              </Badge>
              <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">
                {notification.type}
              </span>
            </div>
            <p className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-4 leading-tight">
              {notification.message}
            </p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--color-border-soft))]">
              <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
              {!notification.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification._id)}
                  icon={LuCheck}
                  className="!text-[11px] !px-3 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)] cursor-pointer"
                >
                  Mark Read
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
