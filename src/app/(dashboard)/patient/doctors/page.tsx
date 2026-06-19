"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuStethoscope, LuSearch, LuStar, LuCalendarPlus } from "react-icons/lu";
import Link from "next/link";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 h-44">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

const SPECIALTIES = ["All", "Cardiology", "General Practice", "Dermatology", "Orthopedics", "Neurology", "Pediatrics"];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const showToast = useCallback((msg: string) => setToastMsg(msg), []);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const { data } = await axios.get(`${BASE_URL}/doctor/all`, {
          headers: authHeaders(),
        });
        setDoctors(data.data ?? data ?? []);
      } catch (err: any) {
        showToast(err?.response?.data?.message ?? "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [showToast]);

  const filtered = doctors.filter(d => {
    const name = d.userId?.fullName ?? "";
    const specialty = d.specialization ?? "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                        specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = selectedSpecialty === "All" || specialty === selectedSpecialty;
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3">
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
          <LuStethoscope className="text-[18px]" /> Doctor Directory
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Browse our network of verified specialists
        </p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text" placeholder="Search by name or specialty..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[12px] rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] outline-none focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {SPECIALTIES.map(s => (
              <button key={s} onClick={() => setSelectedSpecialty(s)}
                className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all
                  ${selectedSpecialty === s
                    ? "bg-[hsl(var(--color-primary))] text-white"
                    : "bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))]"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-10 text-center">
            <LuStethoscope className="text-[40px] text-[hsl(var(--color-text-muted))] mx-auto mb-3 opacity-30" />
            <p className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">No doctors found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <div key={d._id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col justify-between hover:border-[hsl(var(--color-primary)/0.3)] transition-all shadow-sm">
                <div>
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0">
                      <span className="text-[20px] font-black text-[hsl(var(--color-primary))]">
                        {(d.userId?.fullName ?? "D")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-[hsl(var(--color-text))]">
                        Dr. {d.userId?.fullName ?? "Unknown"}
                      </p>
                      <p className="text-[10px] font-bold text-[hsl(var(--color-primary-strong))] uppercase tracking-wider">
                        {d.specialization ?? "General Practice"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 mb-4">
                    {d.experience && (
                      <div className="flex-1 bg-[hsl(var(--color-bg-soft))] rounded-xl p-2.5 text-center">
                        <p className="text-[16px] font-black text-[hsl(var(--color-text))]">{d.experience}</p>
                        <p className="text-[9px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Yrs Exp</p>
                      </div>
                    )}
                    <div className="flex-1 bg-[hsl(var(--color-bg-soft))] rounded-xl p-2.5 text-center">
                      <p className="text-[16px] font-black text-[hsl(var(--color-success))] flex items-center justify-center gap-0.5">
                        <LuStar className="text-xs" /> 4.8
                      </p>
                      <p className="text-[9px] font-bold text-[hsl(var(--color-text-muted))] uppercase">Rating</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {d.bio && (
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2 mb-3">{d.bio}</p>
                  )}
                </div>

                {/* Book Button */}
                <Link href={`/patient/doctors/${d._id}/book`}
                  className="w-full mt-2 py-2.5 rounded-xl border border-[hsl(var(--color-primary)/0.3)] text-[hsl(var(--color-primary-strong))] text-[11px] font-black flex items-center justify-center gap-2 hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all"
                >
                  <LuCalendarPlus className="text-sm" /> Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
