"use client";

import { useState, useEffect, useCallback } from "react";
import { LuTriangleAlert, LuRefreshCw, LuMailOpen, LuMail, LuPhone, LuUser, LuClock, LuSearch } from "react-icons/lu";
import { adminService } from "@/services/adminService";
import Pagination from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filter, setFilter] = useState("all");
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getSupportMessages(page, PAGE_SIZE, debouncedSearch, filter);
      setMessages(res.data.messages);
      setPagination(res.data.pagination);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

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
    <div className="flex flex-col flex-1 min-h-screen relative min-w-0">
      <DashboardHeader 
        title="Support Messages" 
        subtitle="View and manage messages from the support contact form." 
        onRefresh={fetchMessages}
      />

      <main className="flex-1 overflow-auto min-w-0 bg-[hsl(var(--color-bg-base))]">
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 min-h-[500px]">
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
            <div className="relative w-full sm:w-80">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl text-sm outline-none focus:border-[hsl(var(--color-primary))] focus:ring-1 focus:ring-[hsl(var(--color-primary))] transition-all text-[hsl(var(--color-text))]"
              />
            </div>
            
            <div className="flex bg-[hsl(var(--color-bg))] p-1 rounded-xl border border-[hsl(var(--color-border))]">
              {['all', 'unread', 'read'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors capitalize ${
                    filter === f 
                      ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] shadow-sm border border-[hsl(var(--color-border)/0.5)]" 
                      : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center p-12 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] rounded-2xl border border-[hsl(var(--color-danger)/0.2)]">
              <LuTriangleAlert className="w-10 h-10 mb-4" />
              <p className="font-semibold">{error}</p>
              <Button variant="outline" onClick={fetchMessages} className="mt-4 border-[hsl(var(--color-danger)/0.2)] hover:bg-[hsl(var(--color-danger)/0.1)]">Try Again</Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 h-full">
              <LuRefreshCw className="w-8 h-8 animate-spin text-[hsl(var(--color-primary))] mb-4" />
              <p className="text-[hsl(var(--color-text-muted))] text-sm">Loading support messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 h-full text-center">
              <div className="w-16 h-16 bg-[hsl(var(--color-bg-surface))] rounded-full flex items-center justify-center mb-4 border border-[hsl(var(--color-border))] shadow-sm">
                <LuMail className="w-8 h-8 text-[hsl(var(--color-text-muted))] opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-2">Inbox is Empty</h3>
              <p className="text-[hsl(var(--color-text-muted))] max-w-sm">There are currently no support messages to display. You're all caught up!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-200 group ${
                      msg.isRead 
                        ? "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-text-muted)/0.3)] hover:shadow-[var(--shadow-card)]" 
                        : "bg-[hsl(var(--color-primary)/0.02)] border-[hsl(var(--color-primary)/0.3)] shadow-[0_4px_12px_hsl(var(--color-primary)/0.05)]"
                    }`}
                  >
                    {!msg.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--color-primary))] rounded-l-2xl" />
                    )}
                    
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="text-base font-bold text-[hsl(var(--color-text))] pr-2">{msg.subject}</h3>
                        {!msg.isRead && (
                          <Badge variant="primary" className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">New</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 text-[13px] text-[hsl(var(--color-text-muted))] mb-4">
                        <span className="flex items-center gap-2 font-medium text-[hsl(var(--color-text))]">
                          <LuUser className="w-4 h-4 text-[hsl(var(--color-text-muted)/0.7)]" /> 
                          {msg.firstName} {msg.lastName}
                        </span>
                        <span className="flex items-center gap-2">
                          <LuMail className="w-4 h-4 text-[hsl(var(--color-text-muted)/0.7)]" /> 
                          <span className="truncate" title={msg.email}>{msg.email}</span>
                        </span>
                        {msg.phone && (
                          <span className="flex items-center gap-2">
                            <LuPhone className="w-4 h-4 text-[hsl(var(--color-text-muted)/0.7)]" /> 
                            {msg.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <LuClock className="w-4 h-4 text-[hsl(var(--color-text-muted)/0.7)]" /> 
                          {new Date(msg.createdAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="mt-2 pt-4 border-t border-[hsl(var(--color-border)/0.5)]">
                        <p className="text-[14px] text-[hsl(var(--color-text))] whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[hsl(var(--color-border)/0.5)] flex justify-end">
                      <Button 
                        variant={msg.isRead ? "outline" : "primary"}
                        onClick={() => toggleReadStatus(msg._id)}
                        disabled={actionBusy[msg._id]}
                        className={`w-full sm:w-auto h-9 px-4 text-[13px] ${msg.isRead ? 'text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]' : 'shadow-sm'}`}
                      >
                        {msg.isRead ? (
                          <><LuMail className="w-4 h-4 mr-2" /> Mark Unread</>
                        ) : (
                          <><LuMailOpen className="w-4 h-4 mr-2" /> Mark Read</>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="pt-8 pb-2 flex justify-center mt-6">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
