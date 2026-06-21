"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuClipboardList, LuStethoscope, LuCalendar, LuChevronDown, LuChevronUp, LuFileText, LuHistory, LuPill
} from "react-icons/lu";
import MedicalHistoryCard from "@/components/shared/MedicalHistoryCard";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-[12px] font-bold px-4 py-3 rounded-xl shadow-lg">
      {message}
      <button onClick={onClose} className="ml-2 text-red-400 hover:text-red-600">✕</button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

function TimelineAccordionCard({ record }: { record: any }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm hover:border-[hsl(var(--color-primary)/0.5)] transition-all cursor-pointer group w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-primary))] group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white transition-colors">
            <LuCalendar className="text-lg" />
          </span>
          <div>
            <p className="text-[13px] font-black text-[hsl(var(--color-text))]">{dateStr} <span className="text-[11px] text-[hsl(var(--color-text-muted))] ml-1">{timeStr}</span></p>
            <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1 mt-0.5">
               <LuStethoscope className="text-[hsl(var(--color-primary))] flex-shrink-0" /> 
               {record.doctorId?.fullName ?? record.doctorId?.userName ?? "Doctor"} • {record.diagnosis || "No diagnosis recorded"}
            </p>
          </div>
        </div>
        
        <button className="text-[hsl(var(--color-text-muted))] p-1 rounded-md hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
          {expanded ? <LuChevronUp className="text-xl" /> : <LuChevronDown className="text-xl" />}
        </button>
      </div>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-4 cursor-auto border-t border-[hsl(var(--color-border))] pt-4" onClick={(e) => e.stopPropagation()}>
          <MedicalHistoryCard record={record} hideHeader={true} />
        </div>
      )}
    </div>
  );
}

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterText, setFilterText] = useState("");

  const showToast = useCallback((msg: string) => setToastMsg(msg), []);

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;

    async function fetchHistory() {
      setLoading(true);

      try {
        const { data } = await axios.get(`${BASE_URL}/medical-history/${patientId}`, {
          headers: authHeaders(),
        });
        const result = data.data ?? data;
        const fetchedRecords = Array.isArray(result) ? result : result ? [result] : [];
        // Sort descending by date
        setRecords(fetchedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        showToast("Failed to load medical history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user, showToast]);

  // Apply filters
  const filteredRecords = records.filter(r => {
    const search = filterText.toLowerCase();
    const docName = (r.doctorId?.fullName || r.doctorId?.userName || "").toLowerCase();
    const specialty = (r.doctorId?.specialization || "").toLowerCase();
    const diag = (r.diagnosis || "").toLowerCase();
    const medications = (r.prescriptions || []).map((p: any) => (p.medication || p.name || "").toLowerCase()).join(" ");
    
    const matchesText = docName.includes(search) || specialty.includes(search) || diag.includes(search) || medications.includes(search);

    const recordDate = new Date(r.createdAt);
    recordDate.setHours(0, 0, 0, 0);
    
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesStartDate = recordDate >= start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      matchesEndDate = recordDate <= end;
    }

    return matchesText && matchesStartDate && matchesEndDate;
  });

  // Reset infinite scroll when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [filterText, startDate, endDate]);

  const displayedRecords = filteredRecords.slice(0, visibleCount);
  const hasMoreRecords = visibleCount < filteredRecords.length;

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRecords) {
          setVisibleCount(prev => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMoreRecords]);
  // Extract all medications
  const allMedications = useMemo(() => {
    const meds = new Map();
    records.forEach(r => {
      (r.prescriptions || []).forEach((rx: any) => {
        const rxDate = new Date(rx.createdAt || r.createdAt);
        (rx.medications || []).forEach((m: any) => {
          const key = m.medicineName.toLowerCase();
          if (!meds.has(key)) {
            meds.set(key, {
              ...m,
              date: rxDate,
              prescriptionId: rx._id,
              status: rx.status || "completed"
            });
          } else {
             // update with more recent
             if (rxDate > meds.get(key).date) {
               meds.set(key, { ...m, date: rxDate, prescriptionId: rx._id, status: rx.status || "completed" });
             }
          }
        });
      });
    });
    return Array.from(meds.values()).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  }, [records]);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3">
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
          <LuClipboardList className="text-[18px]" /> Medical History
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Your complete clinical encounter records
        </p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
          
          {/* Filters Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-6">
            <h3 className="text-[17px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 shrink-0">
              <LuHistory className="text-sky-600 text-[20px]" /> Full Medical History
            </h3>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-end sm:items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] p-1 rounded-xl">
                <div className="flex flex-col w-full sm:w-auto">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-32 bg-transparent border-none rounded-lg px-2 py-1.5 text-[12px] font-medium outline-none text-[hsl(var(--color-text-muted))]"
                    title="Start Date"
                  />
                </div>
                <span className="text-[hsl(var(--color-text-muted))] font-bold text-[10px] uppercase">-</span>
                <div className="flex flex-col w-full sm:w-auto">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-32 bg-transparent border-none rounded-lg px-2 py-1.5 text-[12px] font-medium outline-none text-[hsl(var(--color-text-muted))]"
                    title="End Date"
                  />
                </div>
              </div>
              <div className="relative w-full sm:flex-1 sm:min-w-[200px] xl:w-auto xl:flex-none">
                <input 
                  type="text"
                  placeholder="Search doctor, diagnosis, medication..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-xl px-4 py-2.5 text-[12px] font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none placeholder:text-[hsl(var(--color-text-muted)/0.5)]"
                />
              </div>
            </div>
          </div>

<div className="flex flex-col lg:flex-row gap-8">
            {/* Timeline Column */}
            <div className="flex-1">
              <h3 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
                <LuHistory className="text-[hsl(var(--color-primary))] text-xl" /> Clinical Visits
              </h3>
              {loading ? (
                <Skeleton />
              ) : records.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl bg-[hsl(var(--color-bg-soft)/0.5)]">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
                     <LuHistory className="text-[32px]" />
                  </div>
                  <p className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">No Medical History</p>
                  <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))] max-w-xs mx-auto leading-relaxed">
                     You have no recorded visits or diagnoses yet.
                  </p>
                </div>
              ) : filteredRecords.length === 0 ? (
                 <div className="text-center py-16 bg-[hsl(var(--color-bg-soft))] rounded-2xl">
                  <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))] mb-2">No records match your filters.</p>
                  <button 
                    onClick={() => { setStartDate(""); setEndDate(""); setFilterText(""); }}
                    className="text-[12px] text-sky-600 font-black hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[hsl(var(--color-border))] before:to-transparent">
                  {displayedRecords.map((r, index) => (
                    <div key={r._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[hsl(var(--color-bg-surface))] bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        <LuFileText />
                      </div>
                      {/* Timeline Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                        <TimelineAccordionCard record={r} />
                      </div>
                    </div>
                  ))}
                  
                  {/* Infinite Scroll Trigger */}
                  {hasMoreRecords && (
                    <div ref={observerTarget} className="flex justify-center py-6 relative z-10">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!hasMoreRecords && filteredRecords.length > 0 && (
                    <div className="text-center py-4 text-xs font-bold text-[hsl(var(--color-text-muted))] relative z-10 bg-[hsl(var(--color-bg-surface))] inline-block px-4 mx-auto md:left-1/2 md:-translate-x-1/2 rounded-full border border-[hsl(var(--color-border-soft))] shadow-sm">
                      End of history ({filteredRecords.length} records)
                    </div>
                  )}
                </div>
              )}
            </div>
                  </div>
                </div>
              )}
            </div>

            {/* Medications Sidebar */}
            <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0">
              {/* Medications Section */}
              {!loading && allMedications.length > 0 && (
                <div className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
                    <LuPill className="text-blue-500 text-lg" /> Patient Medications
                  </h3>
                  <div className="flex flex-col gap-8">
                    {/* Active Medications */}
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                      </h4>
                      {allMedications.filter(m => m.status === 'active').length === 0 ? (
                        <p className="text-[11px] text-gray-500 italic">No active medications.</p>
                      ) : (
                        <div className="space-y-3">
                          {allMedications.filter(m => m.status === 'active').map((med: any, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col hover:border-green-300 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="text-[13px] font-bold text-gray-900">{med.medicineName}</h5>
                                <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">Active</span>
                              </div>
                              <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-2 gap-y-1 mb-2">
                                <span>{med.dosage}</span>
                                <span>•</span>
                                <span>{med.frequency}</span>
                              </div>
                              <div className="text-[9px] font-medium text-gray-400">
                                Since: {med.date.toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Past Medications */}
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span> Past
                      </h4>
                      {allMedications.filter(m => m.status !== 'active').length === 0 ? (
                        <p className="text-[11px] text-gray-500 italic">No past medications.</p>
                      ) : (
                        <div className="space-y-3">
                          {allMedications.filter(m => m.status !== 'active').map((med: any, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col hover:border-gray-300 transition-colors opacity-80">
                              <div className="flex justify-between items-start mb-1">
                                <h5 className="text-[13px] font-bold text-gray-700">{med.medicineName}</h5>
                                <span className="text-[9px] font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-md">Past</span>
                              </div>
                              <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-2 gap-y-1 mb-2">
                                <span>{med.dosage}</span>
                                <span>•</span>
                                <span>{med.frequency}</span>
                              </div>
                              <div className="text-[9px] font-medium text-gray-400">
                                Date: {med.date.toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Infinite Scroll Trigger */}
              {hasMoreRecords && (
                <div ref={observerTarget} className="flex justify-center py-6 relative z-10">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {!hasMoreRecords && filteredRecords.length > 0 && (
                <div className="text-center py-4 text-xs font-bold text-[hsl(var(--color-text-muted))] relative z-10 bg-[hsl(var(--color-bg-surface))] inline-block px-4 mx-auto md:left-1/2 md:-translate-x-1/2 rounded-full border border-[hsl(var(--color-border-soft))] shadow-sm">
                  End of history ({filteredRecords.length} records)
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
