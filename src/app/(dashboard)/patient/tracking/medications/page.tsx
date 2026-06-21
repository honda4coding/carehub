"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { 
    LuPill, LuClock, LuCalendar, 
    LuChevronLeft, LuFlame, LuActivity
} from "react-icons/lu";
import { FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";

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

            const [medsRes, histRes, summRes] = await Promise.all([
                axios.get(`${BASE_URL}/patient/medications/active`, { headers }),
                axios.get(`${BASE_URL}/patient/medications/history`, { headers }),
                axios.get(`${BASE_URL}/patient/medications/summary`, { headers }),
            ]);

            setMedications(medsRes.data.data);
            setHistory(histRes.data.data);
            setSummary(summRes.data.data);
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
            
            // For simplicity, we assume tracking for 'now'.
            // In a real app, the patient might select a specific scheduled dose.
            const scheduledDoseDateTime = new Date().toISOString();

            await axios.post(`${BASE_URL}/patient/medications/track`, {
                prescriptionId: med.prescriptionId,
                medicationId: med.medicationId,
                scheduledDoseDateTime,
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchAllData();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to track dose");
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
        <div className="flex flex-col flex-1 min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-5xl w-full mx-auto">
                <button 
                    onClick={() => router.push("/patient")}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
                >
                    <LuChevronLeft size={16} className="mr-1" />
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Medication Organizer</h1>
                    <p className="text-gray-500 text-sm">Track your doses, monitor your adherence, and stay healthy.</p>
                </div>

                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Adherence Rate</p>
                                <div className="text-3xl font-black text-gray-900">{summary.adherencePercentage}%</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <LuActivity size={24} />
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Current Streak</p>
                                <div className="text-3xl font-black text-gray-900">{summary.currentStreak} Days</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                                <LuFlame size={24} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-500">Taken Doses</span>
                                <span className="text-sm font-bold text-green-600">{summary.totalTaken}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Missed Doses</span>
                                <span className="text-sm font-bold text-red-600">{summary.totalMissed}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Medications */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <LuPill className="text-blue-500" size={20} />
                            Active Medications
                        </h2>
                        
                        {medications.length === 0 ? (
                            <div className="bg-white rounded-[20px] p-10 text-center border border-gray-100 shadow-sm text-gray-500">
                                You currently have no active medications.
                            </div>
                        ) : (
                            medications.map((med) => (
                                <div key={med.medicationId} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{med.medicineName}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <LuPill size={14} className="text-gray-400" /> {med.dosage}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <LuClock size={14} className="text-gray-400" /> {med.frequency}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {med.hasTrackedToday ? (
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 font-medium rounded-xl border border-gray-100">
                                                    <FiCheckCircle size={18} /> Tracked Today
                                                </div>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => handleTrack(med, 'taken')}
                                                        disabled={actionLoading === med.medicationId}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                                                    >
                                                        <FiCheckCircle size={18} /> Taken
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTrack(med, 'missed')}
                                                        disabled={actionLoading === med.medicationId}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-xl transition-colors disabled:opacity-50"
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
                                            <span className="font-medium text-gray-700">Treatment Progress</span>
                                            <span className="font-bold text-blue-600">{med.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                                style={{ width: `${med.progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                                            <span>
                                                {med.isLifelong 
                                                    ? 'Lifelong Treatment' 
                                                    : `${med.daysRemaining} days remaining`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* History */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                            <LuCalendar className="text-blue-500" size={20} />
                            Recent Activity
                        </h2>
                        
                        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
                            {history.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500">
                                    No tracking history yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {history.slice(0, 10).map((record) => {
                                        const med = medications.find(m => m.medicationId === record.medicationId);
                                        const medName = med ? med.medicineName : "Unknown Medication";
                                        
                                        return (
                                            <div key={record._id} className="p-4 flex items-start gap-3">
                                                {record.status === 'taken' ? (
                                                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex flex-shrink-0 items-center justify-center mt-1">
                                                        <FiCheckCircle size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex flex-shrink-0 items-center justify-center mt-1">
                                                        <FiXCircle size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{medName}</p>
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {new Date(record.scheduledDoseDateTime).toLocaleString()}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                        record.status === 'taken' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
