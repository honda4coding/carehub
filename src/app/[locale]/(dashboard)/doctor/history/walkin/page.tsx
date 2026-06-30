"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { 
  LuArrowLeft, LuHistory, LuCalendar, LuStethoscope, LuFileText, LuChevronDown, LuChevronUp, LuSearch, LuArrowDownUp
} from "react-icons/lu";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";
import DashboardHeader from "@/components/global/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

function HistoryCard({ item, index }: { item: any; index: number }) {
    const t = useTranslations("auto");
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
    const t = useTranslations("auto");
  const searchParams = useSearchParams();
  const guestName = searchParams.get('guestName');
  const guestPhone = searchParams.get('guestPhone');
  
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("auth_token");
  const { role } = useAuth();

  // Advanced Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!token || !guestName) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        let url = `${baseUrl}/doctor/patient/history?isOfflinePatient=true&limit=1000`;
        if (guestName) url += `&guestName=${encodeURIComponent(guestName)}`;
        if (guestPhone) {
            url += `&guestPhone=${encodeURIComponent(guestPhone)}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.data.history || []);
      } catch (err) {
        console.error("Failed to fetch walkin history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [guestName, guestPhone, token]);

  const filteredAndSortedHistory = history
    .filter(item => {
      const diagMatch = item.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
      const notesMatch = item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const rxTextMatch = item.prescriptionText?.toLowerCase().includes(searchTerm.toLowerCase());
      const medMatch = item.prescriptions?.some((rx: any) => 
         rx.medications?.some((m: any) => m.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const searchMatch = !searchTerm || diagMatch || notesMatch || rxTextMatch || medMatch;

      let dateMatch = true;
      if (dateFilter) {
         // item.createdAt is ISO string
         const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
         dateMatch = itemDate === dateFilter;
      }

      return searchMatch && dateMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const visibleHistory = filteredAndSortedHistory.slice(0, visibleCount);

  // Infinite Scroll Observer
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 200
      ) {
        if (visibleCount < filteredAndSortedHistory.length) {
          setVisibleCount(prev => prev + 10);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, filteredAndSortedHistory.length]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title={t('walkinMedicalHistory')}
        subtitle={`Visit timeline for: ${guestName}${guestPhone ? ` (${guestPhone})` : ''}`}
        backPath={role === "assistant" ? "/assistant/patients" : "/doctor/patients"}
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Smart Toolbar */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="relative flex-1 w-full">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder={t('searchDiagnosisNotesMedications')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none font-medium text-[hsl(var(--color-text))] focus:border-primary transition-colors"
              />
            </div>

            {/* Date Filter */}
            <div className="relative w-full md:w-auto">
              <LuCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full md:w-auto pl-9 pr-3 py-2.5 text-[12px] font-bold rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer focus:border-primary transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <button 
              onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-border))] text-[hsl(var(--color-text))] font-bold text-[12px] rounded-xl border border-[hsl(var(--color-border))] transition-colors"
            >
              <LuArrowDownUp />
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>

            {/* Clear Filters */}
            {(searchTerm || dateFilter || sortOrder !== "newest") && (
              <button 
                onClick={() => { setSearchTerm(""); setDateFilter(""); setSortOrder("newest"); }}
                className="w-full md:w-auto px-4 py-2.5 bg-danger-light hover:bg-danger-light text-danger font-bold text-[12px] rounded-xl border border-red-100 transition-colors"
              >
                {t('clear')}</button>
            )}

          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">{t('loadingMedicalTimeline')}</p>
            </div>
          ) : visibleHistory.length > 0 ? (
            <div className="relative border-l-2 border-[hsl(var(--color-border))] ml-4 md:ml-6 space-y-8 pb-10">
              {visibleHistory.map((item, index) => (
                <HistoryCard key={item._id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl">
              <LuHistory className="text-6xl text-[hsl(var(--color-text-muted))] opacity-20 mb-4" />
              <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-2">{t('noHistoryFound')}</h2>
              <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))] max-w-sm">
                {t('thisPatientHasntHad')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function WalkinHistoryPage() {
    const t = useTranslations("auto");
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">{t('loading')}</div>}>
      <WalkinHistoryContent />
    </Suspense>
  )
}
