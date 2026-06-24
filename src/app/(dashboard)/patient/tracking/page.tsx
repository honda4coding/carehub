"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import {
  LuActivity, LuPlus, LuTrendingUp, LuCalendarDays, LuHeart, LuDroplets, 
  LuThermometer, LuScale, LuRuler, LuFlame, LuTrophy, LuMedal, LuStar, LuFilter
} from "react-icons/lu";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import MedicationSummaryWidget from "@/components/patients/MedicationSummaryWidget";
import { Card } from "@/components/ui/Card";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import { getLocalVitalsData, saveVitalsData, queueVitalSync } from "@/lib/db";
import { syncVitals } from "@/lib/sync";

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
  const [records, setRecords] = useState<any[]>([]);
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

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      if (!navigator.onLine) {
        const localData = await getLocalVitalsData();
        setRecords(localData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/patient/tracking`, { headers: authHeaders() });
      const result = data.data ?? [];
      
      await saveVitalsData(result);
      setRecords(result.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err: any) {
      const localData = await getLocalVitalsData();
      if (localData.length > 0) {
        setRecords(localData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } else {
        setToast({ msg: err?.response?.data?.message ?? "Failed to load tracking records", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (navigator.onLine) {
        syncVitals().then(() => fetchRecords());
      } else {
        fetchRecords();
      }
    }
  }, [user, fetchRecords]);

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

      if (!navigator.onLine) {
        const syncPayload = { ...payload }; // Clean payload for backend
        
        // Mutate only for local UI state
        const localObj = { 
          ...payload, 
          date: new Date().toISOString(), 
          _id: crypto.randomUUID() 
        };
        
        await queueVitalSync(syncPayload);
        setRecords((prev) => [...prev, localObj].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setToast({ msg: "Offline mode: Vital saved locally and will sync later", type: "success" });
      } else {
        await axios.post(`${BASE_URL}/patient/tracking`, payload, { headers: authHeaders() });
        setToast({ msg: "Record added successfully", type: "success" });
        fetchRecords();
      }

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
      if (!navigator.onLine) {
         setToast({ msg: "Offline mode: Vital saved locally and will sync later", type: "success" });
      } else {
         setToast({ msg: err?.response?.data?.message ?? "Failed to add record", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
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

      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3">
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
          <LuActivity className="text-[hsl(var(--color-primary))]" /> Personal Tracking
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Monitor your vital signs, earn badges, and track your progress!
        </p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
        
        {/* GAMIFICATION BANNER */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* XP & Level Card */}
            <Card className="md:col-span-4 p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center border-2 border-[hsl(var(--color-primary))] shrink-0">
                <span className="font-black text-xl text-[hsl(var(--color-primary))]">{currentLevel}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <h3 className="text-[15px] font-black text-[hsl(var(--color-text))]">Level {currentLevel} Tracker</h3>
                  <span className="text-[13px] font-bold text-[hsl(var(--color-text-muted))]">{xpInCurrentLevel} / 50 XP</span>
                </div>
                <div className="w-full bg-[hsl(var(--color-bg-soft))] rounded-full h-2 overflow-hidden">
                  <div className="bg-[hsl(var(--color-primary))] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </Card>

            {/* Streak Card */}
            <Card className="md:col-span-3 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-black text-[hsl(var(--color-text))]">Current Streak</h3>
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] mt-0.5">Log daily to keep the fire alive!</p>
              </div>
              <div className="flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] px-3 py-1.5 rounded-xl border border-[hsl(var(--color-border))]">
                <LuFlame className={`text-2xl ${currentStreak > 0 ? "text-[hsl(var(--color-warning))] animate-pulse" : "text-[hsl(var(--color-text-muted))]"}`} />
                <span className={`text-xl font-black ${currentStreak > 0 ? "text-[hsl(var(--color-warning))]" : "text-[hsl(var(--color-text-muted))]"}`}>{currentStreak}</span>
              </div>
            </Card>

            {/* Badges Card */}
            <Card className="md:col-span-5 p-4 flex flex-col justify-center">
              <h3 className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-2 flex items-center gap-1"><LuTrophy /> Achievements</h3>
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-1 group relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-[hsl(var(--color-border))] ${hasBeginner ? "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-primary))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                    <LuMedal className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-center w-16">First Log</span>
                </div>
                <div className="flex flex-col items-center gap-1 group relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-[hsl(var(--color-border))] ${hasConsistent ? "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-warning))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                    <LuFlame className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-center w-16">3-Day Streak</span>
                </div>
                <div className="flex flex-col items-center gap-1 group relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-[hsl(var(--color-border))] ${hasHealthy ? "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                    <LuHeart className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-center w-16">Normal BMI</span>
                </div>
                <div className="flex flex-col items-center gap-1 group relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-[hsl(var(--color-border))] ${hasWizard ? "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-danger))]" : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))]"}`}>
                    <LuStar className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-center w-16">10 Logs</span>
                </div>
              </div>
            </Card>

            {/* Medications Tracking Widget (Second Row) */}
            <div className="md:col-span-12 mt-2">
              <MedicationSummaryWidget />
            </div>
          </div>
        )}

        {/* Quick Log Form */}
        <Card className="p-6">
          <h2 className="text-[16px] font-black uppercase text-[hsl(var(--color-text))] mb-5 flex items-center gap-2 border-b border-[hsl(var(--color-border))] pb-3">
            <LuPlus className="text-[hsl(var(--color-primary))]" /> Log New Vitals
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1 flex items-center gap-1"><LuScale /> Weight (kg)</label>
              <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 text-sm outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" placeholder="e.g. 75" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1 flex items-center gap-1"><LuRuler /> Height (cm)</label>
              <input type="number" step="1" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 text-sm outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" placeholder="e.g. 175" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1 flex items-center gap-1"><LuHeart /> Blood Pressure</label>
              <input 
                type="text" 
                value={formData.bloodPressure} 
                onChange={e => {
                  let val = e.target.value.replace(/[^\d]/g, ""); 
                  if (val.length > 3) val = val.substring(0, 3) + "/" + val.substring(3, 5);
                  else if (val.length > 2 && val.startsWith("9")) val = val.substring(0, 2) + "/" + val.substring(2, 4); 
                  setFormData({...formData, bloodPressure: val});
                }} 
                className="border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 text-sm outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" 
                placeholder="120/80" 
                maxLength={7}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1 flex items-center gap-1"><LuDroplets /> Blood Sugar</label>
              <input type="number" value={formData.bloodSugar} onChange={e => setFormData({...formData, bloodSugar: e.target.value})} className="border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 text-sm outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" placeholder="mg/dL" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1 flex items-center gap-1"><LuThermometer /> Temp (°C)</label>
              <input 
                type="text" 
                value={formData.temperature} 
                onChange={e => {
                  let val = e.target.value.replace(/[^\d]/g, "");
                  if (val.length > 2) val = val.substring(0, 2) + "." + val.substring(2, 3);
                  setFormData({...formData, temperature: val});
                }} 
                className="border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 text-sm outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" 
                placeholder="37.5" 
                maxLength={4}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1 flex items-center gap-1"><LuActivity /> Pulse (bpm)</label>
              <input type="number" value={formData.pulse} onChange={e => setFormData({...formData, pulse: e.target.value})} className="border border-[hsl(var(--color-border))] rounded-xl px-3 py-2 text-sm outline-none focus:border-[hsl(var(--color-primary))] bg-[hsl(var(--color-bg-soft))]" placeholder="e.g. 72" />
            </div>
            <div className="flex flex-col justify-end md:col-span-2 items-end mt-2">
              <button disabled={isSubmitting} type="submit" className="cursor-pointer bg-[hsl(var(--color-primary))] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? "Saving..." : <><LuPlus /> Log & Earn XP</>}
              </button>
            </div>
          </form>
        </Card>

        {/* Filters Section */}
        <Card className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
          <h3 className="text-[15px] font-black text-[hsl(var(--color-text))] flex items-center gap-2 w-full sm:w-auto">
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
            <LuTrendingUp className="text-5xl text-[hsl(var(--color-border))] mx-auto mb-4" />
            <p className="text-base font-bold text-[hsl(var(--color-text))]">No Data Found</p>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
              {records.length === 0 ? "Start logging your vitals above to see historical charts." : "No records match the selected dates."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BMI & Weight Card */}
            <Card className="p-5 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[15px] font-black uppercase text-[hsl(var(--color-text))] flex items-center gap-2">
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
            <Card className="p-5 flex flex-col">
              <h3 className="text-base font-black uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
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
            <Card className="p-5 flex flex-col lg:col-span-2">
              <h3 className="text-base font-black uppercase text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
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
        </div>
      </main>
    </div>
  );
}
