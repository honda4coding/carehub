"use client";

import { useState, useEffect, useRef } from "react";
import { LuBell, LuCheck, LuCheckCheck } from "react-icons/lu";
import { fetchClient } from "@/services/fetchClient";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Notification {
  _id: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ── NotificationBell ───────────────────────────────────────────────────────────
export default function NotificationBell({ basePath }: { basePath: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch on mount and every 30s (polling fallback if no socket)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    window.addEventListener("notifications-changed", fetchNotifications);
    return () => {
        clearInterval(interval);
        window.removeEventListener("notifications-changed", fetchNotifications);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchClient.get("/notifications", {
        params: { limit: "20" },
      });
      const data = res.data?.notifications ?? [];
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetchClient.request(`/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetchClient.request("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Icon color per notification type
  const typeDot: Record<string, string> = {
    appointment: "bg-blue-500",
    prescription: "bg-green-500",
    medical_history: "bg-purple-500",
    doctor_registration: "bg-orange-500",
    session: "bg-yellow-500",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] relative transition-colors"
        aria-label="Notifications"
      >
        <LuBell className="text-[15px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full bg-[hsl(var(--color-secondary-strong))] border-2 border-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[9px] font-bold text-white px-[2px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-h-[420px] flex flex-col rounded-[12px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--color-border))] shrink-0">
            <Link
              href={basePath}
              className="text-[13px] font-bold text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-primary))]"
            >
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] text-[10px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </Link>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--color-primary))] hover:opacity-70 transition-opacity"
              >
                <LuCheckCheck className="text-[13px]" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-[12px] text-[hsl(var(--color-text-muted))]">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <LuBell className="text-[24px] text-[hsl(var(--color-text-muted))]" />
                <p className="text-[12px] text-[hsl(var(--color-text-muted))]">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    if (!n.isRead) handleMarkAsRead(n._id);
                    if (n.link) window.location.href = n.link;
                    setOpen(false);
                  }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[hsl(var(--color-border))] last:border-b-0 transition-colors ${
                    n.isRead
                      ? "bg-transparent hover:bg-[hsl(var(--color-bg-soft))]"
                      : "bg-[hsl(var(--color-primary)/0.05)] hover:bg-[hsl(var(--color-primary)/0.08)]"
                  }`}
                >
                  {/* Colored type dot */}
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      typeDot[n.type] ?? "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[12px] leading-snug ${n.isRead ? "text-[hsl(var(--color-text-muted))]" : "text-[hsl(var(--color-text))] font-medium"}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {/* Mark-as-read check */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n._id);
                      }}
                      className="mt-1 text-[hsl(var(--color-primary))] hover:opacity-70"
                      title="Mark as read"
                    >
                      <LuCheck className="text-[13px]" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

