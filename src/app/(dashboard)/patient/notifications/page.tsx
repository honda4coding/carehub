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
} from "react-icons/lu";

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
      className="w-8 h-8 rounded-[9px] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
    >
      <LuChevronLeft className="text-[15px]" />
    </button>

    <div>
      <h1 className="text-[17px] font-black text-[hsl(var(--color-text))] tracking-tight">
        Notifications
      </h1>

      <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5">
        View and manage all notifications
      </p>
    </div>
  </div>

  {/* Card */}
  <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">

    {/* Tabs + Search */}
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex gap-1 flex-wrap w-full sm:w-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] transition-all flex-1 sm:flex-none ${
              activeTab === tab.value
                ? "bg-primary text-white"
                : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto mt-2 sm:mt-0">
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-[8px] bg-primary text-white hover:opacity-90 transition-all flex-1 sm:flex-none whitespace-nowrap"
          >
            <LuCheckCheck />
            Mark All Read
          </button>
        )}

        <div className="relative flex items-center flex-1 sm:flex-none">
          <LuSearch className="absolute left-2.5 text-[12px] text-[hsl(var(--color-text-muted))]" />

          <input
            type="text"
            placeholder="Search notifications..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[11px] font-medium rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] w-full sm:w-[220px] outline-none transition-colors focus:border-[hsl(var(--color-primary)/0.5)]"
          />
        </div>
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
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </td>

                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                        notification.isRead
                          ? "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]"
                          : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                      }`}
                    >
                      {notification.isRead
                        ? "Read"
                        : "Unread"}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <div className="flex justify-center">
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            handleMarkAsRead(
                              notification._id
                            )
                          }
                          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-[7px] border border-[hsl(var(--color-primary)/0.4)] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] hover:bg-primary hover:text-white hover:border-primary transition-all"
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

          {/* Mobile Card View */}
          <div className="lg:hidden flex flex-col gap-4 py-2">
            {filtered.map((notification) => (
              <div key={notification._id} className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 border border-[hsl(var(--color-border))] shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${notification.isRead ? "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"}`}>
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                  <span className="text-[10px] font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-wider">{notification.type}</span>
                </div>
                <p className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-4 leading-tight">{notification.message}</p>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[hsl(var(--color-border-soft))]">
                  <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{new Date(notification.createdAt).toLocaleString()}</p>
                  {!notification.isRead && (
                    <button onClick={() => handleMarkAsRead(notification._id)} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-[8px] bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] hover:bg-primary hover:text-white transition-all border border-[hsl(var(--color-primary)/0.2)]">
                      <LuCheck className="text-[12px]" /> Mark Read
                    </button>
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

