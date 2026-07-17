"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuActivity, LuPlus, LuTrendingUp, LuCalendarDays, LuHeart, LuDroplets, 
  LuThermometer, LuScale, LuRuler, LuFlame, LuTrophy, LuMedal, LuStar, LuFilter, LuCheck
} from "react-icons/lu";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import MedicationSummaryWidget from "@/components/patients/MedicationSummaryWidget";
import { Card } from "@/components/ui/Card";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import DashboardHeader from "@/components/global/DashboardHeader";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function Toast({ message, type = "error", onClose }: { message: string; type?: "error" | "success"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 border text-[13px] font-bold px-4 py-3 rounded-xl  ${
      type === "error" 
        ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))]" 
        : "bg-[hsl(var(--color-success-bg))] border-[hsl(var(--color-success)/0.2)] text-[hsl(var(--color-success))]"
    }`}>
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-6">
      <div className="h-40 bg-[hsl(var(--color-bg-soft))] rounded-2xl w-full" />
      <div className="h-64 bg-[hsl(var(--color-bg-soft))] rounded-2xl w-full" />
    </div>
  );
}

export default function TrackingPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]); // For charts
  const [tableRecords, setTableRecords] = useState<any[]>([]); // For table
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "error"|"success"} | null>(null);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    bloodPressure: "",
    bloodSugar: "",
    temperature: "",
    pulse: "",
    notes: ""
  });

  // Edit State
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    weight: "",
    height: "",
    bloodPressure: "",
    bloodSugar: "",
    temperature: "",
    pulse: ""
  });

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      // Fetch all records for charts
      const { data } = await axios.get(`${BASE_URL}/patient/tracking?getAll=true`, { headers: authHeaders() });
      const result = data.data ?? [];
      setRecords(result.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message ?? "Failed to load tracking charts data", type: "error" });
    }
  }, []);

  const fetchTableRecords = useCallback(async (page: number) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/patient/tracking?page=${page}&limit=${limit}`, { headers: authHeaders() });
      setTableRecords(data.data ?? []);
      if (data.pagination) setTotalPages(data.pagination.pages);
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message ?? "Failed to load tracking table data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (user) {
        fetchRecords();
        fetchTableRecords(currentPage);
    }
  }, [user, fetchRecords, fetchTableRecords, currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {};
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "" && k !== "bloodPressure") payload[k] = k === "notes" ? v : Number(v);
      });

      if (formData.bloodPressure) {
        const parts = formData.bloodPressure.split("/");
        if (parts[0]) payload.bloodPressureSystolic = Number(parts[0]);
        if (parts[1]) payload.bloodPressureDiastolic = Number(parts[1]);
      }

      await axios.post(`${BASE_URL}/patient/tracking`, payload, { headers: authHeaders() });
      setToast({ msg: "Record added successfully", type: "success" });
      fetchRecords();
      fetchTableRecords(1);
      setCurrentPage(1);

      setFormData({
        weight: "",
        height: "",
        bloodPressure: "",
        bloodSugar: "",
        temperature: "",
        pulse: "",
        notes: ""
      });
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message ?? "Failed to add record", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setEditFormData({
      weight: record.weight ? String(record.weight) : "",
      height: record.height ? String(record.height) : "",
      bloodPressure: (record.bloodPressureSystolic && record.bloodPressureDiastolic) ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}` : "",
      bloodSugar: record.bloodSugar ? String(record.bloodSugar) : "",
      temperature: record.temperature ? String(record.temperature) : "",
      pulse: record.pulse ? String(record.pulse) : ""
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSubmitting(true);
    try {
      const payload: any = {};
      Object.entries(editFormData).forEach(([k, v]) => {
        if (v !== "" && k !== "bloodPressure") payload[k] = k === "notes" ? v : Number(v);
        if (v === "") payload[k] = null; // To clear values if needed (requires backend support, but sending empty is fine or we just let it be)
      });

      if (editFormData.bloodPressure) {
        const parts = editFormData.bloodPressure.split("/");
        if (parts[0]) payload.bloodPressureSystolic = Number(parts[0]);
        if (parts[1]) payload.bloodPressureDiastolic = Number(parts[1]);
      } else {
        payload.bloodPressureSystolic = null;
        payload.bloodPressureDiastolic = null;
      }

      await axios.put(`${BASE_URL}/patient/tracking/${editingRecord._id}`, payload, { headers: authHeaders() });
      setToast({ msg: "Record updated successfully", type: "success" });
      setEditingRecord(null);
      fetchRecords();
      fetchTableRecords(currentPage);
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message ?? "Failed to update record", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${BASE_URL}/patient/tracking/${id}`, { headers: authHeaders() });
      setToast({ msg: "Record deleted successfully", type: "success" });
      fetchRecords();
      fetchTableRecords(currentPage);
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message ?? "Failed to delete record", type: "error" });
    }
  };

  // Gamification & Current Metrics Calculations
  const latestRecord = records[records.length - 1];
  let currentBMI = null;
  let bmiStatus = "Unknown";
  let bmiColor = "text-[hsl(var(--color-text-muted))]";
  
  if (latestRecord && latestRecord.weight && latestRecord.height) {
    const hM = latestRecord.height / 100;
    currentBMI = Number((latestRecord.weight / (hM * hM)).toFixed(1));
    if (currentBMI < 18.5) { bmiStatus = "Underweight"; bmiColor = "text-[hsl(var(--color-primary))]"; }
    else if (currentBMI >= 18.5 && currentBMI <= 24.9) { bmiStatus = "Normal"; bmiColor = "text-[hsl(var(--color-success))]"; }
    else if (currentBMI >= 25 && currentBMI <= 29.9) { bmiStatus = "Overweight"; bmiColor = "text-[hsl(var(--color-warning))]"; }
    else { bmiStatus = "Obese"; bmiColor = "text-[hsl(var(--color-danger))]"; }
  }

  // XP and Streak Math
  const totalXP = records.length * 10;
  const currentLevel = Math.floor(totalXP / 50) + 1;
  const xpInCurrentLevel = totalXP % 50;
  const progressPercent = (xpInCurrentLevel / 50) * 100;

  let currentStreak = 0;
  if (records.length > 0) {
    const uniqueDates = Array.from(new Set(records.map(r => new Date(r.date).setHours(0,0,0,0)))).sort((a,b) => b - a);
    const today = new Date().setHours(0,0,0,0);
    const yesterday = today - 86400000;
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      let checkDate = uniqueDates[0];
      for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === checkDate - 86400000) {
          currentStreak++;
          checkDate = uniqueDates[i];
        } else {
          break;
        }
      }
    }
  }

  // Badges Unlock Status
  const hasBeginner = records.length > 0;
  const hasConsistent = currentStreak >= 3;
  const hasHealthy = currentBMI !== null && currentBMI >= 18.5 && currentBMI <= 24.9;
  const hasWizard = records.length >= 10;

  // Today's Status
  const hasLoggedToday = records.some(r => new Date(r.date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0));

  // Quick Stats Validation & Colors
  const getBPColor = (sys: number, dia: number) => {
    if (sys > 140 || dia > 90) return 'text-[hsl(var(--color-danger))]';
    if (sys > 120 || dia > 80) return 'text-[hsl(var(--color-warning))]';
    return 'text-[hsl(var(--color-success))]';
  };
  const getSugarColor = (sugar: number) => {
    if (sugar > 140) return 'text-[hsl(var(--color-danger))]';
    if (sugar < 70) return 'text-[hsl(var(--color-warning))]';
    return 'text-[hsl(var(--color-success))]';
  };
  const getPulseColor = (pulse: number) => {
    if (pulse > 100 || pulse < 60) return 'text-[hsl(var(--color-warning))]';
    return 'text-[hsl(var(--color-success))]';
  };

  // Form Warnings
  const isHighBP = formData.bloodPressure && (parseInt(formData.bloodPressure.split('/')[0]) > 140 || parseInt(formData.bloodPressure.split('/')[1]) > 90);
  const isHighSugar = formData.bloodSugar && parseInt(formData.bloodSugar) > 200;
  const isFever = formData.temperature && parseFloat(formData.temperature) > 38.0;

  // Chart Data Processing (with filters)
  const chartData = useMemo(() => {
    let filtered = records;
    if (startDate) {
      const start = new Date(startDate).setHours(0,0,0,0);
      filtered = filtered.filter(r => new Date(r.date).setHours(0,0,0,0) >= start);
    }
    if (endDate) {
      const end = new Date(endDate).setHours(23,59,59,999);
      filtered = filtered.filter(r => new Date(r.date).getTime() <= end);
    }

    return filtered.map(r => {
      const date = new Date(r.date);
      let bmi = null;
      if (r.weight && r.height) {
        const hMeters = r.height / 100;
        bmi = Number((r.weight / (hMeters * hMeters)).toFixed(1));
      }
      return {
        ...r,
        displayDate: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        bmi
      };
    });
  }, [records, startDate, endDate]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <DashboardHeader
        title="Personal Tracking"
        subtitle="Monitor your vital signs, earn badges, and track your progress!"
        showBack={true}
      />

      <main className="flex-1 p-4 pb-32 md:p-6 md:pb-32 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TODAY'S STATUS BANNER */}
        {!loading && (
          <div className={`p-4 rounded-2xl flex items-center justify-between border ${hasLoggedToday ? 'bg-[hsl(var(--color-success))/0.1] border-[hsl(var(--color-success))/0.2] text-[hsl(var(--color-success))]' : 'bg-[hsl(var(--color-warning))/0.1] border-[hsl(var(--color-warning))/0.2] text-[hsl(var(--color-warning))]'}`}>
            <div className="flex items-center gap-3">
              {hasLoggedToday ? <LuCheck className="text-2xl" /> : <LuActivity className="text-2xl animate-pulse" />}
              <div>
                <h3 className="font-bold text-[15px]">{hasLoggedToday ? "You're all set for today! 🎉" : "You haven't logged your vitals today"}</h3>
                <p className="text-[13px] opacity-80">{hasLoggedToday ? "Great job keeping up with your health." : "Take a moment to record your health stats."}</p>
              </div>
            </div>
          </div>
        )}

        {/* QUICK STATS ROW */}
        {!loading && latestRecord && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center shadow-[var(--shadow-card)]">
              <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Blood Pressure</span>
              <span className={`text-xl font-black ${latestRecord.bloodPressureSystolic ? getBPColor(latestRecord.bloodPressureSystolic, latestRecord.bloodPressureDiastolic) : 'text-[hsl(var(--color-text))]'}`}>
                {latestRecord.bloodPressureSystolic ? `${latestRecord.bloodPressureSystolic}/${latestRecord.bloodPressureDiastolic}` : '-'}
              </span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center shadow-[var(--shadow-card)]">
              <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Pulse</span>
              <span className={`text-xl font-black ${latestRecord.pulse ? getPulseColor(latestRecord.pulse) : 'text-[hsl(var(--color-text))]'}`}>
                {latestRecord.pulse ? `${latestRecord.pulse} bpm` : '-'}
              </span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center shadow-[var(--shadow-card)]">
              <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Blood Sugar</span>
              <span className={`text-xl font-black ${latestRecord.bloodSugar ? getSugarColor(latestRecord.bloodSugar) : 'text-[hsl(var(--color-text))]'}`}>
                {latestRecord.bloodSugar ? `${latestRecord.bloodSugar} mg/dL` : '-'}
              </span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center shadow-[var(--shadow-card)]">
              <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">BMI</span>
              <span className={`text-xl font-black ${bmiColor}`}>
                {currentBMI ? currentBMI : '-'}
              </span>
            </Card>
          </div>
        )}

        {/* GAMIFICATION BANNER */}
        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            
            {/* XP & Level Card */}
            <Card className="xl:col-span-4 p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0">
                <span className="font-bold text-xl text-[hsl(var(--color-primary))]">{currentLevel}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between items-end mb-1.5 gap-x-2">
                  <h3 className="text-[15px] font-bold tracking-tight text-[hsl(var(--color-text))] truncate">Level {currentLevel} Tracker</h3>
                  <span className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] whitespace-nowrap">{xpInCurrentLevel} / 50 XP</span>
                </div>
                <div className="w-full bg-[hsl(var(--color-bg-soft))] rounded-full h-2 overflow-hidden">
                  <div className="bg-[hsl(var(--color-primary))] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </Card>

            {/* Streak Card */}
            <Card className="xl:col-span-3 p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold tracking-tight text-[hsl(var(--color-text))] truncate">Current Streak</h3>
                <p className="text-[12px] text-[hsl(var(--color-text-muted))] mt-0.5 line-clamp-2">Log daily to keep the fire alive!</p>
              </div>
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--color-bg-soft))] shrink-0">
                <LuFlame className={`text-[20px] ${currentStreak > 0 ? "text-[hsl(var(--color-warning))]" : "text-[hsl(var(--color-text-muted))]"}`} />
                <span className={`text-[13px] font-bold -mt-1 ${currentStreak > 0 ? "text-[hsl(var(--color-warning))]" : "text-[hsl(var(--color-text-muted))]"}`}>{currentStreak}</span>
              </div>
            </Card>

            {/* Badges Card */}
            <Card className="xl:col-span-5 p-5 flex flex-col justify-center min-w-0">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-3 flex items-center gap-1.5"><LuTrophy /> Achievements</h3>
              <div className="flex items-center justify-around flex-wrap gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasBeginner ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-border))]"}`}>
                    <LuMedal className="text-xl" />
                  </div>
                  <span className={`text-[11px] font-medium text-center w-16 ${hasBeginner ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"}`}>First Log</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasConsistent ? "bg-[hsl(var(--color-warning)/0.1)] text-[hsl(var(--color-warning))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-border))]"}`}>
                    <LuFlame className="text-xl" />
                  </div>
                  <span className={`text-[11px] font-medium text-center w-16 ${hasConsistent ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"}`}>3-Day</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasHealthy ? "bg-[hsl(var(--color-success)/0.1)] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-border))]"}`}>
                    <LuHeart className="text-xl" />
                  </div>
                  <span className={`text-[11px] font-medium text-center w-16 ${hasHealthy ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"}`}>Normal BMI</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasWizard ? "bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-border))]"}`}>
                    <LuStar className="text-xl" />
                  </div>
                  <span className={`text-[11px] font-medium text-center w-16 ${hasWizard ? "text-[hsl(var(--color-text))]" : "text-[hsl(var(--color-text-muted))]"}`}>10 Logs</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Second Row: Medication & Log Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-5 flex flex-col">
            <MedicationSummaryWidget />
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <Card className="p-6 h-full flex flex-col justify-between">
              <div className="mb-5 flex items-center justify-between border-b border-[hsl(var(--color-border))] pb-4">
                <h2 className="text-[15px] font-bold tracking-tight uppercase text-[hsl(var(--color-text))] flex items-center gap-2">
                  <LuPlus size={18} className="text-[hsl(var(--color-primary))]" />
                  Log New Vitals
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="flex flex-col relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuScale /> Weight (kg)</label>
                  <input type="number" step="0.1" min="20" max="300" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))] transition-colors" placeholder={latestRecord?.weight ? `Last: ${latestRecord.weight}` : "e.g. 75"} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuRuler /> Height (cm)</label>
                  <input type="number" step="1" min="50" max="250" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))] transition-colors" placeholder={latestRecord?.height ? `Last: ${latestRecord.height}` : "e.g. 175"} />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuHeart /> Blood Pressure</label>
                  <input 
                    type="text" 
                    value={formData.bloodPressure} 
                    onChange={e => {
                      let val = e.target.value.replace(/[^\d]/g, ""); 
                      if (val.length > 3) val = val.substring(0, 3) + "/" + val.substring(3, 5);
                      else if (val.length > 2 && val.startsWith("9")) val = val.substring(0, 2) + "/" + val.substring(2, 4); 
                      setFormData({...formData, bloodPressure: val});
                    }} 
                    className={`w-full h-11 border rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none transition-colors ${isHighBP ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger))/0.05]' : 'border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]'}`} 
                    placeholder={latestRecord?.bloodPressureSystolic ? `Last: ${latestRecord.bloodPressureSystolic}/${latestRecord.bloodPressureDiastolic}` : "120/80"} 
                    maxLength={7}
                  />
                  {isHighBP && <span className="text-[10px] text-[hsl(var(--color-danger))] mt-1">⚠️ High BP</span>}
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuDroplets /> Blood Sugar</label>
                  <input type="number" min="20" max="600" value={formData.bloodSugar} onChange={e => setFormData({...formData, bloodSugar: e.target.value})} className={`w-full h-11 border rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none transition-colors ${isHighSugar ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger))/0.05]' : 'border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]'}`} placeholder={latestRecord?.bloodSugar ? `Last: ${latestRecord.bloodSugar}` : "mg/dL"} />
                  {isHighSugar && <span className="text-[10px] text-[hsl(var(--color-danger))] mt-1">⚠️ High Sugar</span>}
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuThermometer /> Temp (°C)</label>
                  <input 
                    type="text" 
                    value={formData.temperature} 
                    onChange={e => {
                      let val = e.target.value.replace(/[^\d]/g, "");
                      if (val.length > 2) val = val.substring(0, 2) + "." + val.substring(2, 3);
                      setFormData({...formData, temperature: val});
                    }} 
                    className={`w-full h-11 border rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none transition-colors ${isFever ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger))/0.05]' : 'border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]'}`} 
                    placeholder={latestRecord?.temperature ? `Last: ${latestRecord.temperature}` : "37.5"} 
                    maxLength={4}
                  />
                  {isFever && <span className="text-[10px] text-[hsl(var(--color-danger))] mt-1">⚠️ Fever</span>}
                </div>
                <div className="flex flex-col relative">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuActivity /> Pulse (bpm)</label>
                  <input type="number" min="30" max="250" value={formData.pulse} onChange={e => setFormData({...formData, pulse: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))] transition-colors" placeholder={latestRecord?.pulse ? `Last: ${latestRecord.pulse}` : "e.g. 72"} />
                </div>
                <div className="flex flex-col justify-end col-span-1 sm:col-span-2 xl:col-span-3 items-end mt-4">
                  <button disabled={isSubmitting} type="submit" className="w-full sm:w-auto cursor-pointer bg-[hsl(var(--color-primary))] text-white font-bold text-[14px] px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? "Saving..." : <><LuPlus size={18} /> Log & Earn XP</>}
                  </button>
                </div>
              </form>
            </Card>
      </div>
    </div>

        {/* Filters Section */}
        <Card className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px">
          <h3 className="text-[15px] font-bold tracking-tight text-[hsl(var(--color-text))] flex items-center gap-2 w-full sm:w-auto">
            <LuFilter className="text-[hsl(var(--color-primary))]" /> Compare Periods
          </h3>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={(startDate || endDate) ? () => { setStartDate(""); setEndDate(""); } : undefined}
            className="!mt-0 w-full sm:w-auto flex-1 justify-end"
          />
        </Card>

        {loading ? <Skeleton /> : chartData.length === 0 ? (
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-[hsl(var(--color-bg-soft))] rounded-full flex items-center justify-center mx-auto mb-4">
              <LuTrendingUp className="text-3xl text-[hsl(var(--color-text-muted))]" />
            </div>
            <p className="text-lg font-bold text-[hsl(var(--color-text))]">No Data Found</p>
            <p className="text-[14px] text-[hsl(var(--color-text-muted))] mt-1 font-medium">
              {records.length === 0 ? "Start logging your vitals above to unlock historical charts." : "No records match the selected dates."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BMI & Weight Card */}
            <Card className="p-5 flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px min-w-0">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[15px] font-bold tracking-tight uppercase text-[hsl(var(--color-text))] flex items-center gap-2">
                  <LuScale className="text-[hsl(var(--color-primary))]" /> Weight & BMI Trends
                </h3>
                {currentBMI && (
                  <div className="text-right">
                    <p className="text-xl font-black text-[hsl(var(--color-text))]">{currentBMI}</p>
                    <p className={`text-[12px] font-bold uppercase ${bmiColor}`}>{bmiStatus}</p>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Line yAxisId="left" type="monotone" name="Weight (kg)" dataKey="weight" stroke="hsl(var(--color-primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                    <Line yAxisId="left" type="monotone" name="BMI" dataKey="bmi" stroke="hsl(var(--color-success))" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Blood Pressure Card */}
            <Card className="p-5 flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px min-w-0">
              <h3 className="text-[15px] font-bold tracking-tight uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
                <LuHeart className="text-[hsl(var(--color-danger))]" /> Blood Pressure History
              </h3>
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '12px', fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Line type="monotone" name="Systolic" dataKey="bloodPressureSystolic" stroke="hsl(var(--color-danger))" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                    <Line type="monotone" name="Diastolic" dataKey="bloodPressureDiastolic" stroke="hsl(var(--color-primary))" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Blood Sugar & Temp Card */}
            <Card className="p-5 flex flex-col lg:col-span-2 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px min-w-0">
              <h3 className="text-[15px] font-bold tracking-tight uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
                <LuDroplets className="text-[hsl(var(--color-primary))]" /> Sugar & Pulse Trends
              </h3>
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--color-text-muted))" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--color-border))', fontSize: '13px', fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Line yAxisId="left" type="monotone" name="Blood Sugar (mg/dL)" dataKey="bloodSugar" stroke="hsl(var(--color-primary))" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                    <Line yAxisId="right" type="monotone" name="Pulse (bpm)" dataKey="pulse" stroke="hsl(var(--color-warning))" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        )}

        {/* History Log Table */}
        {!loading && tableRecords.length > 0 && (
          <Card className="p-5 flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px mt-6">
            <h3 className="text-[15px] font-bold tracking-tight uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-4">
              <LuCalendarDays className="text-[hsl(var(--color-primary))]" /> History Log
            </h3>
            
            {/* Desktop Table (Hidden on mobile/tablet) */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]">
                    <th className="p-3 font-bold uppercase tracking-widest">Date</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Weight</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Height</th>
                    <th className="p-3 font-bold uppercase tracking-widest">BP</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Sugar</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Temp</th>
                    <th className="p-3 font-bold uppercase tracking-widest">Pulse</th>
                    <th className="p-3 font-bold uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRecords.map((record, i) => (
                    <tr key={record._id || i} className="border-b border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
                      <td className="p-3 font-medium whitespace-nowrap">{new Date(record.date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="p-3">{record.weight ? `${record.weight} kg` : '-'}</td>
                      <td className="p-3">{record.height ? `${record.height} cm` : '-'}</td>
                      <td className="p-3">{(record.bloodPressureSystolic && record.bloodPressureDiastolic) ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}` : '-'}</td>
                      <td className="p-3">{record.bloodSugar ? `${record.bloodSugar} mg/dL` : '-'}</td>
                      <td className="p-3">{record.temperature ? `${record.temperature} °C` : '-'}</td>
                      <td className="p-3">{record.pulse ? `${record.pulse} bpm` : '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(record)} className="px-3 py-1.5 bg-[hsl(var(--color-primary))/0.1] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-white rounded-md text-xs font-bold transition-colors">Edit</button>
                          <button onClick={() => handleDelete(record._id)} className="px-3 py-1.5 bg-[hsl(var(--color-danger))/0.1] text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger))] hover:text-white rounded-md text-xs font-bold transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards (Hidden on desktop) */}
            <div className="flex flex-col gap-4 lg:hidden">
              {tableRecords.map((record, i) => (
                <div key={record._id || i} className="border border-[hsl(var(--color-border))] rounded-xl p-4 bg-[hsl(var(--color-bg-soft))]">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-[hsl(var(--color-border))]">
                    <span className="font-bold text-[13px]">{new Date(record.date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(record)} className="p-1.5 bg-[hsl(var(--color-primary))/0.1] text-[hsl(var(--color-primary))] rounded-md hover:bg-[hsl(var(--color-primary))] hover:text-white transition-colors"><LuActivity size={16} /></button>
                      <button onClick={() => handleDelete(record._id)} className="p-1.5 bg-[hsl(var(--color-danger))/0.1] text-[hsl(var(--color-danger))] rounded-md hover:bg-[hsl(var(--color-danger))] hover:text-white transition-colors"><span className="text-[14px] leading-none block px-1">✕</span></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[12px]">
                    <div className="flex flex-col">
                      <span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold text-[10px]">Weight</span>
                      <span className="font-medium">{record.weight ? `${record.weight} kg` : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold text-[10px]">Height</span>
                      <span className="font-medium">{record.height ? `${record.height} cm` : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold text-[10px]">BP</span>
                      <span className="font-medium">{(record.bloodPressureSystolic && record.bloodPressureDiastolic) ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}` : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold text-[10px]">Sugar</span>
                      <span className="font-medium">{record.bloodSugar ? `${record.bloodSugar} mg/dL` : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold text-[10px]">Temp</span>
                      <span className="font-medium">{record.temperature ? `${record.temperature} °C` : '-'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[hsl(var(--color-text-muted))] uppercase tracking-wider font-bold text-[10px]">Pulse</span>
                      <span className="font-medium">{record.pulse ? `${record.pulse} bpm` : '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[hsl(var(--color-border))]">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-lg text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--color-border))] transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">
                    Page <span className="text-[hsl(var(--color-text))]">{currentPage}</span> of {totalPages}
                  </span>
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-lg text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--color-border))] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </Card>
        )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button 
              onClick={() => setEditingRecord(null)}
              className="absolute top-4 right-4 text-2xl text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-black mb-6 text-[hsl(var(--color-text))] flex items-center gap-2">
              <LuActivity className="text-[hsl(var(--color-primary))]" /> Edit Vitals
            </h2>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuScale /> Weight (kg)</label>
                <input type="number" step="0.1" min="20" max="300" value={editFormData.weight} onChange={e => setEditFormData({...editFormData, weight: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" />
              </div>
              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuRuler /> Height (cm)</label>
                <input type="number" step="1" min="50" max="250" value={editFormData.height} onChange={e => setEditFormData({...editFormData, height: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" />
              </div>
              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuHeart /> Blood Pressure</label>
                <input type="text" value={editFormData.bloodPressure} onChange={e => {
                    let val = e.target.value.replace(/[^\d]/g, ""); 
                    if (val.length > 3) val = val.substring(0, 3) + "/" + val.substring(3, 5);
                    else if (val.length > 2 && val.startsWith("9")) val = val.substring(0, 2) + "/" + val.substring(2, 4); 
                    setEditFormData({...editFormData, bloodPressure: val});
                  }} 
                  className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" 
                  maxLength={7}
                />
              </div>
              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuDroplets /> Blood Sugar</label>
                <input type="number" min="20" max="600" value={editFormData.bloodSugar} onChange={e => setEditFormData({...editFormData, bloodSugar: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" />
              </div>
              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuThermometer /> Temp (°C)</label>
                <input type="text" value={editFormData.temperature} onChange={e => {
                    let val = e.target.value.replace(/[^\d]/g, "");
                    if (val.length > 2) val = val.substring(0, 2) + "." + val.substring(2, 3);
                    setEditFormData({...editFormData, temperature: val});
                  }} 
                  className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" 
                  maxLength={4}
                />
              </div>
              <div className="flex flex-col relative">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-1.5 flex items-center gap-1.5"><LuActivity /> Pulse (bpm)</label>
                <input type="number" min="30" max="250" value={editFormData.pulse} onChange={e => setEditFormData({...editFormData, pulse: e.target.value})} className="w-full h-11 border border-[hsl(var(--color-border))] rounded-lg px-3 text-[14px] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setEditingRecord(null)} className="px-6 py-2.5 rounded-lg font-bold text-[14px] text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-soft))] hover:opacity-80 transition-opacity">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg font-bold text-[14px] text-white bg-[hsl(var(--color-primary))] hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
