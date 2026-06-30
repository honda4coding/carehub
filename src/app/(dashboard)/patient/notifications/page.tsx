"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/services/fetchClient";

import { Notification, TabValue } from "@/components/patients/notifications/types";
import DashboardHeader from "@/components/global/DashboardHeader";
import NotificationFilters from "@/components/patients/notifications/NotificationFilters";
import NotificationDesktopTable from "@/components/patients/notifications/NotificationDesktopTable";
import NotificationMobileList from "@/components/patients/notifications/NotificationMobileList";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);

  const debouncedFilter = useDebounce(filter, 400);

  useEffect(() => {
    // Reset page to 1 whenever tab or filter changes
    setPage(1);
  }, [activeTab, debouncedFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [page, activeTab, debouncedFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchClient.get("/notifications", {
        params: { 
          page: page.toString(),
          limit: "10",
          tab: activeTab,
          search: debouncedFilter
        },
      });
      setNotifications(res.data?.notifications ?? []);
      setServerUnreadCount(res.data?.unreadCount ?? 0);
      setTotalPages(res.data?.pagination?.totalPages || 1);
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

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setServerUnreadCount(Math.max(0, serverUnreadCount - 1));
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

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
      setServerUnreadCount(0);
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title="Notifications"
        subtitle="View and manage all your notifications"
        backPath="/patient"
      />
      <div className="flex-1 overflow-auto min-w-0 bg-[hsl(var(--color-bg))]">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
        <NotificationFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filter={filter}
          setFilter={setFilter}
          unreadCount={serverUnreadCount}
          handleMarkAllAsRead={handleMarkAllAsRead}
        />

        <div className="overflow-x-auto -mx-4 px-4">
          <NotificationDesktopTable
            loading={loading}
            filtered={notifications}
            handleMarkAsRead={handleMarkAsRead}
          />
          <NotificationMobileList
            loading={loading}
            filtered={notifications}
            handleMarkAsRead={handleMarkAsRead}
          />
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>
        </div>
      </div>
    </div>
  );
}
