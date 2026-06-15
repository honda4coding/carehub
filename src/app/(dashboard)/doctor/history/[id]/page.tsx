"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { 
  LuArrowLeft, LuHistory, LuCalendar, LuStethoscope, LuFileText, LuChevronDown, LuChevronUp, LuSearch, LuArrowDownUp
} from "react-icons/lu";

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
        className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
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
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Vitals & Health Info */}
            {(item.height || item.weight || item.bloodType || (item.allergies && item.allergies.length > 0) || (item.chronic && item.chronic.length > 0)) && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-[12px] font-bold text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] p-4 rounded-xl border border-[hsl(var(--color-border))]">
                  <div className="flex flex-col gap-2">
                    {item.height && <span>Height: <span className="text-[hsl(var(--color-text))]">{item.height}</span></span>}
                    {item.weight && <span>Weight: <span className="text-[hsl(var(--color-text))]">{item.weight}</span></span>}
                    {item.bloodType && <span>Blood Type: <span className="text-red-500">{item.bloodType}</span></span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.allergies && item.allergies.length > 0 && (
                      <span>Allergies: <span className="text-orange-500 whitespace-normal">{item.allergies.join(", ")}</span></span>
                    )}
                    {item.chronic && item.chronic.length > 0 && (
                      <span>Chronic Diseases: <span className="text-orange-500 whitespace-normal">{item.chronic.join(", ")}</span></span>
                    )}
                  </div>
               </div>
            )}

            {/* Surgeries */}
            {item.surgeries && item.surgeries.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                  <LuStethoscope className="text-primary" /> Past Surgeries
                </h4>
                <div className="space-y-2">
                  {item.surgeries.map((s: any, i: number) => (
                    <div key={i} className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border))] flex flex-col gap-1 text-[13px]">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[hsl(var(--color-text))]">{s.operationName}</span>
                        {s.date && <span className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">{s.date}</span>}
                      </div>
                      {s.surgeonName && <span className="text-[hsl(var(--color-text-muted))]">Surgeon: {s.surgeonName}</span>}
                      {s.report && <span className="text-[hsl(var(--color-text-muted))] mt-1 text-[12px]">{s.report}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnosis */}
            {item.diagnosis && (
              <div className="mb-4">
                <h4 className="text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                  <LuStethoscope className="text-primary" /> Full Diagnosis
                </h4>
                <p className="text-[15px] font-bold text-[hsl(var(--color-text))] leading-relaxed whitespace-pre-wrap">
                  {item.diagnosis}
                </p>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="mb-4">
                <h4 className="text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                  <LuFileText className="text-primary" /> Doctor Notes
                </h4>
                <div className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border))]">
                  <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] leading-relaxed whitespace-pre-wrap">
                    {item.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Prescriptions (Medications) */}
            {item.prescriptions && item.prescriptions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                  <LuFileText className="text-primary" /> Prescribed Medications
                </h4>
                <div className="space-y-3">
                  {item.prescriptions.map((rx: any, idx: number) => (
                    <div key={rx._id || idx} className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-2">
                      {rx.medications && rx.medications.map((med: any, mIdx: number) => (
                         <div key={med._id || mIdx} className="flex flex-col border-b border-primary/10 last:border-0 pb-2 last:pb-0">
                           <span className="text-[14px] font-bold text-primary">{med.medicineName}</span>
                           <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                             {med.dosage} - {med.frequency} for {med.duration}
                           </span>
                           {med.instructions && (
                             <span className="text-[11px] mt-1 text-[hsl(var(--color-text-muted))] italic">"{med.instructions}"</span>
                           )}
                         </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Prescription Text */}
            {item.prescriptionText && (
              <div className="mb-4">
                <h4 className="text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                  <LuFileText className="text-primary" /> Prescription Text
                </h4>
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/20">
                  <p className="text-[13px] font-bold text-primary leading-relaxed whitespace-pre-wrap">
                    {item.prescriptionText}
                  </p>
                </div>
              </div>
            )}

            {/* Documents / Files */}
            {item.documents && item.documents.length > 0 && (
              <div>
                <h4 className="text-[12px] font-black uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1.5">
                  <LuFileText className="text-primary" /> Documents & Results
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {item.documents.map((doc: any, idx: number) => (
                    <a 
                      key={doc._id || idx} 
                      href={doc.secure_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border))] flex flex-col hover:border-primary transition-colors"
                    >
                      <span className="text-[12px] font-bold text-[hsl(var(--color-text))] truncate">{doc.title}</span>
                      <span className="text-[10px] font-black uppercase text-primary mt-1">{doc.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

function OnlinePatientHistoryContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const patientName = searchParams.get('name') || "Unknown Patient";
  const patientPhone = searchParams.get('phone');

  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("auth_token");

  // Advanced Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!token || !id) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await axios.get(`${baseUrl}/doctor/patient/history?patientId=${id}&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.data.history || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, token]);

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
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center gap-4 shadow-sm z-10 sticky top-0">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-[hsl(var(--color-bg-soft))] hover:bg-primary hover:text-white rounded-lg transition-colors border border-[hsl(var(--color-border))] flex-shrink-0"
        >
          <LuArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuHistory className="text-primary" /> Patient Medical History
          </h1>
          <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mt-1">
            Complete visit timeline for: <span className="font-bold text-[hsl(var(--color-text))]">{patientName}</span> {patientPhone ? `(${patientPhone})` : ''}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Smart Toolbar */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="relative flex-1 w-full">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--color-text-muted))]" />
              <input
                type="text"
                placeholder="Search diagnosis, notes, medications..."
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
                className="w-full md:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[12px] rounded-xl border border-red-100 transition-colors"
              >
                Clear
              </button>
            )}

          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-[14px] font-bold text-[hsl(var(--color-text-muted))]">Loading medical timeline...</p>
            </div>
          ) : visibleHistory.length > 0 ? (
            <div className="relative border-l-2 border-[hsl(var(--color-border))] ml-4 md:ml-6 space-y-8 pb-10">
              {visibleHistory.map((item, index) => (
                <HistoryCard key={item._id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm">
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

export default function OnlinePatientHistoryPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-20 min-h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <OnlinePatientHistoryContent />
    </Suspense>
  )
}
