"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { 
  LuArrowLeft, LuHistory, LuCalendar, LuStethoscope, LuFileText, LuChevronDown, LuChevronUp, LuSearch, LuArrowDownUp, LuLoader
} from "react-icons/lu";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

function HistoryCard({ item, index }: { item: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative pl-8 md:pl-10">
      {/* Timeline Node */}
      <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-[hsl(var(--color-bg-surface))] flex items-center justify-center ${index === 0 ? 'bg-primary' : 'bg-[hsl(var(--color-text-muted))]'}`}>
         {index === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
      </span>
      
      {/* Card Content */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 transition-all cursor-pointer group"
      >
        
        {/* Top Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-4 ${expanded ? 'border-b border-[hsl(var(--color-border))] pb-4 mb-4' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[hsl(var(--color-bg-soft))] text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <LuCalendar className="text-lg" />
            </span>
            <div>
              <p className="text-[14px] font-black text-[hsl(var(--color-text))]">{dateStr}</p>
              <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">{timeStr}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="text-[hsl(var(--color-text-muted))] p-1 rounded-md hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
              {expanded ? <LuChevronUp className="text-xl" /> : <LuChevronDown className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Collapsed Preview */}
        {!expanded && (
          <div className="mt-3">
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] line-clamp-1 flex items-center gap-2">
              <LuStethoscope className="text-primary flex-shrink-0" /> 
              {item.diagnosis || "No diagnosis recorded"}
            </p>
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-4 cursor-auto border-t border-[hsl(var(--color-border))] pt-4" onClick={(e) => e.stopPropagation()}>
            <MedicalHistoryCard record={item} hideHeader={true} />
          </div>
        )}

      </div>
    </div>
  );
}

function WalkinHistoryContent() {
  const searchParams = useSearchParams();
  const guestName = searchParams.get('guestName');
  const guestPhone = searchParams.get('guestPhone');
  
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const token = Cookies.get("auth_token");
  const { role } = useAuth();

  // Server-side Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Reset and refetch when filters change
  useEffect(() => {
    setPage(1);
    setHistory([]);
  }, [debouncedSearch, startDateFilter, endDateFilter, sortOrder]);

  const fetchHistory = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!token || !guestName) return;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      let url = `${baseUrl}/doctor/patient/history?isOfflinePatient=true&page=${pageNum}&limit=${LIMIT}&sortOrder=${sortOrder}`;
      if (guestName) url += `&guestName=${encodeURIComponent(guestName)}`;
      if (guestPhone) url += `&guestPhone=${encodeURIComponent(guestPhone)}`;
      
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      if (startDateFilter) {
        url += `&startDate=${startDateFilter}T00:00:00.000Z`;
      }
      if (endDateFilter) {
        url += `&endDate=${endDateFilter}T23:59:59.999Z`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newHistory = res.data.data.history || [];
      const pagination = res.data.data.pagination || {};
      
      if (append) {
        setHistory(prev => [...prev, ...newHistory]);
      } else {
        setHistory(newHistory);
      }
      setTotalRecords(pagination.total || 0);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch walkin history:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [guestName, guestPhone, token, debouncedSearch, startDateFilter, endDateFilter, sortOrder]);

  useEffect(() => {
    fetchHistory(page, page > 1);
  }, [page, fetchHistory]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title="Walk-in Medical History"
        subtitle={`Visit timeline for: ${guestName}${guestPhone ? ` (${guestPhone})` : ''}`}
        backPath={role === "assistant" ? "/assistant/patients" : "/doctor/patients"}
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Smart Toolbar */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center flex-wrap">
            
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder="Search diagnosis, notes, or medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none font-medium text-[hsl(var(--color-text))] focus:border-primary transition-colors"
              />
            </div>

            {/* Date Range Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer focus:border-primary transition-colors"
                />
              </div>
              <span className="text-[hsl(var(--color-text-muted))] font-bold">-</span>
              <div className="relative">
                <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Sort Toggle */}
            <button 
              onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border))] text-[hsl(var(--color-text))] font-bold text-[12px] rounded-xl border border-[hsl(var(--color-border))] transition-colors whitespace-nowrap"
            >
              <LuArrowDownUp />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </button>

            {/* Clear Filters */}
            {(searchTerm || startDateFilter || endDateFilter || sortOrder !== "desc") && (
              <button 
                onClick={() => { setSearchTerm(""); setStartDateFilter(""); setEndDateFilter(""); setSortOrder("desc"); }}
                className="px-4 py-2.5 bg-danger-light hover:bg-danger-light text-danger font-bold text-[12px] rounded-xl border border-red-100 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}

          </div>

          {/* Record count indicator */}
          {!loading && totalRecords > 0 && (
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mb-4">
              Showing {history.length} of {totalRecords} records
            </p>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">Loading medical timeline...</p>
            </div>
          ) : history.length > 0 ? (
            <>
              <div className="relative border-l-2 border-[hsl(var(--color-border))] ml-4 md:ml-6 space-y-8 pb-10">
                {history.map((item, index) => (
                  <HistoryCard key={item._id} item={item} index={index} />
                ))}
              </div>

              {/* Load More Button */}
              {page < totalPages && (
                <div className="flex justify-center mt-6 pb-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 cursor-pointer text-white font-bold text-[13px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <LuLoader className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${totalRecords - history.length} remaining)`
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl">
              <LuHistory className="text-6xl text-[hsl(var(--color-text-muted))] opacity-20 mb-4" />
              <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-2">No History Found</h2>
              <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] max-w-sm">
                This patient hasn't had any completed sessions with you yet, or no medical notes were recorded.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function WalkinHistoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <WalkinHistoryContent />
    </Suspense>
  )
}
