"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/services/fetchClient";

import DashboardHeader from "@/components/global/DashboardHeader";
import NotificationsFilters, { TabValue } from "@/components/admin/notifications/NotificationsFilters";
import NotificationsList, { Notification } from "@/components/admin/notifications/NotificationsList";
import { useTranslations } from "next-intl";

export default function NotificationsPage() {
    const t = useTranslations("auto");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await fetchClient.get("/notifications", {
        params: { limit: "100" },
      });

      setNotifications(res.data?.notifications ?? []);
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
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetchClient.request("/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const filtered = notifications
    .filter((n) => {
      if (activeTab === "read") return n.isRead;
      if (activeTab === "unread") return !n.isRead;
      return true;
    })
    .filter((n) => n.message.toLowerCase().includes(filter.toLowerCase()));

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader title={t('notifications')} subtitle="View and manage all system notifications" backPath="/admin" />
      <div className="flex-1 overflow-auto min-w-0 bg-[hsl(var(--color-bg))]">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
        <NotificationsFilters
          filter={filter}
          setFilter={setFilter}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalCount={notifications.length}
          readCount={readCount}
          unreadCount={unreadCount}
          handleMarkAllAsRead={handleMarkAllAsRead}
        />

        <NotificationsList
          notifications={filtered}
          loading={loading}
          handleMarkAsRead={handleMarkAsRead}
        />
      </div>
        </div>
      </div>
    </div>
  );
}
