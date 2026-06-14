"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuClipboardList, LuStethoscope, LuCalendarDays,
  LuFileText, LuPill, LuExternalLink,
} from "react-icons/lu";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateStr; }
}

const DOC_ICONS: Record<string, string> = {
  lab: "🧪", xray: "🩻", mri: "🧠", ct: "💻", prescription: "💊", other: "📄"
};

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

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => setToastMsg(msg), []);

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;

    async function fetchHistory() {
      try {
        const { data } = await axios.get(`${BASE_URL}/medical-history/${patientId}`, {
          headers: authHeaders(),
        });
        const result = data.data ?? data;
        setRecords(Array.isArray(result) ? result : result ? [result] : []);
      } catch (err: any) {
        showToast(err?.response?.data?.message ?? "Failed to load medical history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user, showToast]);

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
        {loading ? <Skeleton /> : records.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-10 text-center">
            <LuClipboardList className="text-[40px] text-[hsl(var(--color-text-muted))] mx-auto mb-3 opacity-30" />
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">No medical history records found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {records.map((r) => {
              const isOpen = expanded === r._id;
              return (
                <div key={r._id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden">
                  {/* Card Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : r._id)}
                    className="w-full p-5 flex items-start justify-between gap-4 hover:bg-[hsl(var(--color-bg-soft))] transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0">
                        <LuStethoscope className="text-[18px]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-[hsl(var(--color-text))]">
                          {r.doctorId?.fullName ?? r.doctorId?.userName ?? "Doctor"}
                        </p>
                        <p className="text-[10px] font-bold text-[hsl(var(--color-primary-strong))] uppercase tracking-wider">
                          {r.doctorId?.specialization ?? "General Practice"}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[hsl(var(--color-text-muted))] font-bold">
                          <LuCalendarDays className="text-xs" />
                          {formatDate(r.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.documents?.length > 0 && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
                          {r.documents.length} docs
                        </span>
                      )}
                      <span className="text-[10px] font-black text-[hsl(var(--color-text-muted))]">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-[hsl(var(--color-border-soft))]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">

                        {/* Diagnosis & Notes */}
                        <div>
                          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase mb-1.5">Diagnosis</p>
                          <p className="text-[13px] font-bold text-[hsl(var(--color-text))] mb-4">{r.diagnosis ?? "—"}</p>
                          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase mb-1.5">Clinical Notes</p>
                          <p className="text-[12px] text-[hsl(var(--color-text-muted))] leading-relaxed">{r.notes ?? "—"}</p>
                        </div>

                        {/* Documents */}
                        <div>
                          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase mb-2 flex items-center gap-1.5">
                            <LuFileText className="text-xs" /> Associated Documents
                          </p>
                          {(!r.documents || r.documents.length === 0) ? (
                            <p className="text-[11px] text-[hsl(var(--color-text-muted))]">No documents attached.</p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {r.documents.map((doc: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={doc.secure_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] hover:border-[hsl(var(--color-primary)/0.3)] transition-all group"
                                >
                                  <span className="text-[18px]">{DOC_ICONS[doc.type] ?? "📄"}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-[hsl(var(--color-text))] truncate">{doc.title}</p>
                                    <p className="text-[9px] text-[hsl(var(--color-text-muted))] uppercase font-bold">{doc.type}</p>
                                  </div>
                                  <LuExternalLink className="text-xs text-[hsl(var(--color-text-muted))] group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Linked Prescriptions */}
                      {r.prescriptions?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border-soft))]">
                          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase mb-2 flex items-center gap-1.5">
                            <LuPill className="text-xs" /> Linked Prescriptions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {r.prescriptions.map((p: any, idx: number) => (
                              <span key={idx} className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
                                💊 {p.medication ?? p.name ?? `Prescription ${idx + 1}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
