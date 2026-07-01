"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/services/fetchClient";

import DashboardHeader from "@/components/global/DashboardHeader";
import NotificationsFilters, { TabValue } from "@/components/admin/notifications/NotificationsFilters";
import NotificationsList, { Notification } from "@/components/admin/notifications/NotificationsList";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);
  const [serverReadCount, setServerReadCount] = useState(0);

  const debouncedFilter = useDebounce(filter, 400);

  useEffect(() => {
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

      const resData = res.data ?? {};
      setNotifications(resData.notifications ?? []);
      const pagination = resData.pagination ?? {};
      setServerTotal(pagination.total ?? 0);
      setServerUnreadCount(resData.unreadCount ?? 0);
      setServerReadCount((pagination.total ?? 0) - (resData.unreadCount ?? 0));
      setTotalPages(pagination.totalPages || 1);
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

  // No local filtering/counting needed anymore

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader title="Notifications" subtitle="View and manage all your notifications" backPath="/doctor" />
      <div className="flex-1 overflow-auto min-w-0 bg-[hsl(var(--color-bg))]">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">
        <NotificationsFilters
          filter={filter}
          setFilter={setFilter}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalCount={serverTotal}
          readCount={serverReadCount}
          unreadCount={serverUnreadCount}
          handleMarkAllAsRead={handleMarkAllAsRead}
        />

        <NotificationsList
          notifications={notifications}
          loading={loading}
          handleMarkAsRead={handleMarkAsRead}
        />

        {!loading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
