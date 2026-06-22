"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "@/services/fetchClient";

import {
LuBell,
LuCheck,
LuCheckCheck,
LuChevronLeft,
LuSearch,
LuFilter,
} from "react-icons/lu";

import { Button } from "@/components/ui/Button";

interface Notification {
_id: string;
message: string;
type: string;
isRead: boolean;
createdAt: string;
link?: string;
}

const TABS = [
{ label: "All", value: "all" },
{ label: "Unread", value: "unread" },
{ label: "Read", value: "read" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function NotificationsPage() {
const router = useRouter();

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
    prev.map((n) =>
      n._id === id ? { ...n, isRead: true } : n
    )
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
.filter((n) =>
n.message.toLowerCase().includes(filter.toLowerCase())
);

const unreadCount = notifications.filter(
(n) => !n.isRead
).length;

return ( 
    <div className="flex-1 p-4 md:p-6 overflow-auto bg-[hsl(var(--color-bg))]">

  {/* Header */}
  <div className="flex items-center gap-3 mb-6">
    <button
      onClick={() => router.back()}
      className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-all cursor-pointer shadow-sm"
    >
      <LuChevronLeft className="text-[15px]" />
    </button>

    <div>
      <h1 className="text-[17px] md:text-[19px] font-black text-[hsl(var(--color-text))] tracking-tight">
        Notifications
      </h1>
      <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
        View and manage all notifications
      </p>
    </div>
  </div>

  {/* Card */}
  <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4">

    {/* Card header — search + tabs + actions */}
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
        <div className="relative flex items-center w-full max-w-[300px]">
          <LuSearch className="absolute left-3 text-[14px] text-[hsl(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[13px] font-medium rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full outline-none focus:border-[hsl(var(--color-primary)/0.5)] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)] transition-all cursor-text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto shrink-0">
        {/* Status tabs */}
        <div className="flex items-center gap-1 flex-wrap bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl border border-[hsl(var(--color-border))] w-full sm:w-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = tab.value === "all" ? notifications.length : notifications.filter((n) => (tab.value === "read" ? n.isRead : !n.isRead)).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border))]"
                    : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]"
                      : "bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-muted))]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            icon={LuCheckCheck}
            className="!text-[12px] !font-bold !px-3 !py-1.5 !h-auto !rounded-[8px] shadow-sm flex-1 sm:flex-none"
          >
            Mark All Read
          </Button>
        )}
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto -mx-4 px-4">
      {loading ? (
        <p className="text-center text-[12px] text-[hsl(var(--color-text-muted))] py-10">
          Loading...
        </p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LuBell className="text-[28px] text-[hsl(var(--color-text-muted))]" />
          <p className="mt-2 text-[12px] text-[hsl(var(--color-text-muted))]">
            No notifications found
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <table className="w-full min-w-[700px] hidden lg:table">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border))]">
                {["Message", "Type", "Date", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[12px] font-black text-[hsl(var(--color-text))] uppercase tracking-[.07em] text-left pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((notification) => (
                <tr
                  key={notification._id}
                  className="border-b border-[hsl(var(--color-border-soft))] last:border-b-0 hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                >
                  <td className="py-3.5 pr-4 text-left">
                    <p className="text-[13px] font-bold text-[hsl(var(--color-text))] leading-tight">
                      {notification.message}
                    </p>
                  </td>

                  <td className="py-3.5 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] text-left whitespace-nowrap">
                    {notification.type}
                  </td>

                  <td className="py-3.5 pr-4 text-[13px] font-semibold text-[hsl(var(--color-text-muted))] text-left whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 pr-4 text-left">
                    <span
                      className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                        notification.isRead
                          ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]"
                          : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                      }`}
                    >
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </td>

                  <td className="py-3.5 pr-4">
                    <div className="flex justify-start">
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification._id)}
                          icon={LuCheck}
                          className="!text-[11px] !px-3 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)]"
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
            {filtered.map((notification) => (
              <div key={notification._id} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${notification.isRead ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"}`}>
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                  <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">{notification.type}</span>
                </div>
                <p className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-4 leading-tight">{notification.message}</p>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--color-border-soft))]">
                  <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{new Date(notification.createdAt).toLocaleDateString()}</p>
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      icon={LuCheck}
                      className="!text-[11px] !px-3 !py-1.5 !h-auto !rounded-[8px] text-[hsl(var(--color-success))] border-[hsl(var(--color-success)/0.3)] hover:bg-[hsl(var(--color-success-bg))] hover:text-[hsl(var(--color-success))] hover:border-[hsl(var(--color-success)/0.5)]"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
</div>

);
}

