"use client";

import { useState, useEffect, useCallback } from "react";
import { LuTriangleAlert, LuRefreshCw, LuMailOpen, LuMail, LuPhone, LuUser, LuClock } from "react-icons/lu";
import { adminService } from "@/services/adminService";
import Pagination from "@/components/ui/Pagination";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface SupportMessage {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminSupportMessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getSupportMessages(page, PAGE_SIZE);
      setMessages(res.data.messages);
      setPagination(res.data.pagination);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleReadStatus = async (msgId: string) => {
    setActionBusy((prev) => ({ ...prev, [msgId]: true }));
    try {
      await adminService.toggleSupportMessageReadStatus(msgId);
      toast.success("Message status updated");
      setMessages(messages.map(m => m._id === msgId ? { ...m, isRead: !m.isRead } : m));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionBusy((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader 
          title="Support Messages" 
          subtitle="View and manage messages from the support contact form." 
        />
        <Button 
          variant="outline" 
          onClick={fetchMessages} 
          disabled={isLoading}
          className="gap-2"
        >
          <LuRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] rounded-2xl border border-[hsl(var(--color-danger)/0.2)]">
          <LuTriangleAlert className="w-10 h-10 mb-4" />
          <p className="font-semibold">{error}</p>
          <Button variant="outline" onClick={fetchMessages} className="mt-4 border-[hsl(var(--color-danger)/0.2)] hover:bg-[hsl(var(--color-danger)/0.1)]">Try Again</Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-12">
          <LuRefreshCw className="w-8 h-8 animate-spin text-[hsl(var(--color-primary))]" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))]">
          <LuMail className="w-12 h-12 text-[hsl(var(--color-text-muted))] mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-2">No messages</h3>
          <p className="text-[hsl(var(--color-text-muted))]">There are no support messages to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg._id} 
              className={`p-6 rounded-2xl border transition-colors ${
                msg.isRead 
                  ? "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))]" 
                  : "bg-[hsl(var(--color-primary)/0.05)] border-[hsl(var(--color-primary)/0.2)]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[hsl(var(--color-text))]">{msg.subject}</h3>
                    {!msg.isRead && (
                      <Badge variant="primary" className="text-xs">New</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--color-text-muted))]">
                    <span className="flex items-center gap-1.5"><LuUser className="w-4 h-4" /> {msg.firstName} {msg.lastName}</span>
                    <span className="flex items-center gap-1.5"><LuMail className="w-4 h-4" /> {msg.email}</span>
                    <span className="flex items-center gap-1.5"><LuPhone className="w-4 h-4" /> {msg.phone}</span>
                    <span className="flex items-center gap-1.5"><LuClock className="w-4 h-4" /> {new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <Button 
                  variant={msg.isRead ? "outline" : "primary"}
                  onClick={() => toggleReadStatus(msg._id)}
                  disabled={actionBusy[msg._id]}
                  className="shrink-0"
                >
                  {msg.isRead ? (
                    <><LuMail className="w-4 h-4 mr-2" /> Mark as Unread</>
                  ) : (
                    <><LuMailOpen className="w-4 h-4 mr-2" /> Mark as Read</>
                  )}
                </Button>
              </div>
              <div className="bg-[hsl(var(--color-bg))] p-4 rounded-xl text-[hsl(var(--color-text))] whitespace-pre-wrap border border-[hsl(var(--color-border))]">
                {msg.message}
              </div>
            </div>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
