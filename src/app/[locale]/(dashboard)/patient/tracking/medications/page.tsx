"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { 
    LuPill, LuClock, LuCalendar, 
    LuChevronLeft, LuFlame, LuActivity, LuHistory
} from "react-icons/lu";
import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ActiveMedication {
    prescriptionId: string;
    medicationId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    frequencyPerDay: number;
    duration: string;
    startDate: string;
    endDate: string | null;
    isLifelong: boolean;
    daysCompleted: number;
    daysRemaining: number | null;
    progress: number;
    hasTrackedToday?: boolean;
}

interface HistoryRecord {
    _id: string;
    medicationId: string;
    prescriptionId: string;
    scheduledDoseDateTime: string;
    status: 'taken' | 'missed';
    completedAt: string;
}

interface Summary {
    activeMedicationsCount: number;
    overallProgress: number;
    adherencePercentage: number;
    totalTaken: number;
    totalMissed: number;
    currentStreak: number;
}

export default function MedicationTrackingPage() {
    const [medications, setMedications] = useState<ActiveMedication[]>([]);
    const [pastMedications, setPastMedications] = useState<any[]>([]);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const router = useRouter();

    const fetchAllData = async () => {
        try {
            const token = Cookies.get(AUTH_COOKIE_NAME);
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            const [medsRes, histRes, summRes, rxRes] = await Promise.all([
                axios.get(`${BASE_URL}/patient/medications/active`, { headers }),
                axios.get(`${BASE_URL}/patient/medications/history`, { headers }),
                axios.get(`${BASE_URL}/patient/medications/summary`, { headers }),
                axios.get(`${BASE_URL}/patient/prescriptions`, { headers }),
            ]);

            const active = medsRes.data.data ?? [];
            const hist = histRes.data.data ?? [];
            const summ = summRes.data.data ?? null;
            const prescriptions = rxRes.data.data ?? (Array.isArray(rxRes.data) ? rxRes.data : []);

            const pastMedsMap = new Map();
            const now = new Date();
            
            prescriptions.forEach((rx: any) => {
              const rxDate = new Date(rx.createdAt);
              (rx.medications || []).forEach((m: any) => {
                 let isActive = false;
                 let isLifelong = false;
                 let totalDays = 0;
                 if (m.duration) {
                    const durationStr = String(m.duration).toLowerCase();
                    const match = durationStr.match(/(\d+)\s*(days?|weeks?|months?)/i);
                    if (durationStr === 'lifelong') isLifelong = true;
                    else if (match) {
                       const num = parseInt(match[1], 10);
                       const unit = match[2];
                       if (unit.startsWith('day')) totalDays = num;
                       else if (unit.startsWith('week')) totalDays = num * 7;
                       else if (unit.startsWith('month')) totalDays = num * 30;
                    } else if (!isNaN(parseInt(durationStr, 10))) {
                       totalDays = parseInt(durationStr, 10);
                    }
                 }
                 if (isLifelong) isActive = true;
                 else {
                    const endDate = new Date(rxDate);
                    endDate.setDate(endDate.getDate() + totalDays);
                    if (now <= endDate || (now > endDate && (now.getTime() - endDate.getTime()) < 24 * 60 * 60 * 1000)) {
                        isActive = true;
                    }
                 }
                 
                 const finalStatus = (isActive && rx.status === 'active') ? 'active' : 'completed';
                 
                 if (finalStatus === 'completed') {
                    const key = m.medicineName.toLowerCase();
                    if (!pastMedsMap.has(key)) {
                       pastMedsMap.set(key, { ...m, date: rxDate });
                    } else if (rxDate > pastMedsMap.get(key).date) {
                       pastMedsMap.set(key, { ...m, date: rxDate });
                    }
                 }
              });
            });
            const pastRaw = Array.from(pastMedsMap.values()).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
            const activeMedsNames = new Set(active.map((a: any) => a.medicineName.toLowerCase()));
            const pastMeds = pastRaw.filter((p: any) => !activeMedsNames.has(p.medicineName.toLowerCase()));

            setMedications(active);
            setPastMedications(pastMeds);
            setHistory(hist);
            setSummary(summ);
        } catch (err) {
            console.error("Failed to load medication data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleTrack = async (med: ActiveMedication, status: 'taken' | 'missed') => {
        try {
            setActionLoading(med.medicationId);
            const token = Cookies.get(AUTH_COOKIE_NAME);
            
            const scheduledDoseDateTime = new Date().toISOString();
            
            const payload = {
                prescriptionId: med.prescriptionId,
                medicationId: med.medicationId,
                scheduledDoseDateTime,
                status
            };

            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${BASE_URL}/patient/medications/track`, payload, { headers });
            fetchAllData();
        } catch (err) {
            console.error("Failed to track medication", err);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col flex-1 p-6 animate-pulse">
                <div className="h-8 bg-gray-200 w-1/4 rounded mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))] p-4 md:p-8">
            <div className="max-w-5xl w-full mx-auto">
                <button 
                    onClick={() => router.push("/patient")}
                    className="flex items-center text-sm font-medium text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors mb-6 cursor-pointer"
                >
                    <LuChevronLeft size={16} className="me-1" />
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-2">Medication Organizer</h1>
                    <p className="text-[hsl(var(--color-text-muted))] text-sm">Track your doses, monitor your adherence, and stay healthy.</p>
                </div>

                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-1">Adherence Rate</p>
                                <div className="text-3xl font-black text-[hsl(var(--color-text))]">{summary.adherencePercentage}%</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-primary))] flex items-center justify-center">
                                <LuActivity size={24} />
                            </div>
                        </Card>
                        
                        <Card className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-1">Current Streak</p>
                                <div className="text-3xl font-black text-[hsl(var(--color-text))]">{summary.currentStreak} Days</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-warning))] flex items-center justify-center">
                                <LuFlame size={24} />
                            </div>
                        </Card>

                        <Card className="p-6 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[hsl(var(--color-text-muted))]">Taken Doses</span>
                                <span className="text-sm font-bold text-[hsl(var(--color-success))]">{summary.totalTaken}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[hsl(var(--color-text-muted))]">Missed Doses</span>
                                <span className="text-sm font-bold text-[hsl(var(--color-danger))]">{summary.totalMissed}</span>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Medications & Past Medications */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-[hsl(var(--color-text))] flex items-center gap-2">
                                <LuPill className="text-[hsl(var(--color-primary))]" size={20} />
                                Active Medications
                            </h2>
                        
                        {medications.length === 0 ? (
                            <Card className="p-10 text-center text-[hsl(var(--color-text-muted))]">
                                You currently have no active medications.
                            </Card>
                        ) : (
                            medications.map((med) => (
                                <Card key={med.medicationId} className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-[hsl(var(--color-text))] mb-1">{med.medicineName}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--color-text-muted))]">
                                                <span className="flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] px-2 py-1 rounded-md">
                                                    <LuPill size={14} className="text-[hsl(var(--color-text-muted))]" /> {med.dosage}
                                                </span>
                                                <span className="flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] px-2 py-1 rounded-md">
                                                    <LuClock size={14} className="text-[hsl(var(--color-text-muted))]" /> {med.frequency}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {med.hasTrackedToday ? (
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] font-medium rounded-xl border border-[hsl(var(--color-border))]">
                                                    <FiCheckCircle size={18} /> Tracked Today
                                                </div>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleTrack(med, 'taken')}
                                                        disabled={actionLoading === med.medicationId}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--color-bg-soft))] hover:opacity-80 text-[hsl(var(--color-success))] font-medium rounded-xl transition-opacity disabled:opacity-50 cursor-pointer border border-[hsl(var(--color-border))]"
                                                    >
                                                        <FiCheckCircle size={18} /> Taken
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTrack(med, 'missed')}
                                                        disabled={actionLoading === med.medicationId}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--color-bg-soft))] hover:opacity-80 text-[hsl(var(--color-danger))] font-medium rounded-xl transition-opacity disabled:opacity-50 cursor-pointer border border-[hsl(var(--color-border))]"
                                                    >
                                                        <FiXCircle size={18} /> Missed
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-[hsl(var(--color-text))]">Treatment Progress</span>
                                            <span className="font-bold text-[hsl(var(--color-primary))]">{med.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[hsl(var(--color-bg-soft))] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[hsl(var(--color-primary))] rounded-full transition-all duration-500" 
                                                style={{ width: `${med.progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-[hsl(var(--color-text-muted))] mt-1">
                                            <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                                            <span>
                                                {med.isLifelong 
                                                    ? 'Lifelong Treatment' 
                                                    : `${med.daysRemaining} days remaining`}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                        
                        {pastMedications.length > 0 && (
                            <div className="space-y-6 pt-6 border-t border-[hsl(var(--color-border))]">
                                <h2 className="text-lg font-bold text-[hsl(var(--color-text))] flex items-center gap-2">
                                    <LuHistory className="text-[hsl(var(--color-text-muted))]" size={20} />
                                    Past Medications
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {pastMedications.map((med: any, idx: number) => {
                                        let durationDays = 0;
                                        if (med.duration) {
                                            const durationStr = String(med.duration).toLowerCase();
                                            const match = durationStr.match(/(\d+)\s*(days?|weeks?|months?)/i);
                                            if (match) {
                                                const num = parseInt(match[1], 10);
                                                const unit = match[2];
                                                if (unit.startsWith('day')) durationDays = num;
                                                else if (unit.startsWith('week')) durationDays = num * 7;
                                                else if (unit.startsWith('month')) durationDays = num * 30;
                                            } else if (!isNaN(parseInt(durationStr, 10))) {
                                                durationDays = parseInt(durationStr, 10);
                                            }
                                        }
                                        const endedAt = new Date(med.date.getTime() + durationDays * 24 * 60 * 60 * 1000);
                                        return (
                                            <Card key={idx} className="p-4 bg-[hsl(var(--color-bg-surface))] opacity-80 border border-[hsl(var(--color-border))] transition-opacity hover:opacity-100">
                                                <h3 className="text-[15px] font-bold text-[hsl(var(--color-text))] mb-2">{med.medicineName}</h3>
                                                <div className="flex flex-wrap gap-2 mb-2 text-xs font-bold text-[hsl(var(--color-text-muted))]">
                                                    <span className="bg-[hsl(var(--color-bg-soft))] px-2 py-0.5 rounded-md">{med.dosage}</span>
                                                    <span className="bg-[hsl(var(--color-bg-soft))] px-2 py-0.5 rounded-md">{med.frequency}</span>
                                                </div>
                                                <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-medium mt-3 flex items-center gap-1 border-t border-[hsl(var(--color-border-soft))] pt-2">
                                                    <LuCalendar size={12} /> Ended: {endedAt.toLocaleDateString()}
                                                </p>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* History */}
                    <div>
                        <h2 className="text-lg font-bold text-[hsl(var(--color-text))] flex items-center gap-2 mb-6">
                            <LuCalendar className="text-[hsl(var(--color-primary))]" size={20} />
                            Recent Activity
                        </h2>
                        
                        <Card className="overflow-hidden">
                            {history.length === 0 ? (
                                <div className="p-6 text-center text-sm text-[hsl(var(--color-text-muted))]">
                                    No tracking history yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-[hsl(var(--color-border))]">
                                    {history.map((record) => {
                                        const med = medications.find(m => m.medicationId === record.medicationId);
                                        const medName = med ? med.medicineName : "Unknown Medication";
                                        
                                        return (
                                            <div key={record._id} className="p-4 flex items-start gap-3">
                                                {record.status === 'taken' ? (
                                                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-success))] flex flex-shrink-0 items-center justify-center mt-1 border border-[hsl(var(--color-border))]">
                                                        <FiCheckCircle size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-danger))] flex flex-shrink-0 items-center justify-center mt-1 border border-[hsl(var(--color-border))]">
                                                        <FiXCircle size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-[hsl(var(--color-text))]">{medName}</p>
                                                    <p className="text-xs text-[hsl(var(--color-text-muted))] mb-1">
                                                        {new Date(record.scheduledDoseDateTime).toLocaleString()}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] ${
                                                        record.status === 'taken' 
                                                            ? 'text-[hsl(var(--color-success))]' 
                                                            : 'text-[hsl(var(--color-danger))]'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
