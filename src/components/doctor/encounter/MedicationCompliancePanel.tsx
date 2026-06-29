"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuFlame, LuPill, LuActivity } from "react-icons/lu";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import DateRangeFilter from "@/components/ui/DateRangeFilter";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ComplianceAlert {
    type: "warning" | "critical";
    message: string;
}

interface ComplianceData {
    adherencePercentage: number;
    complianceStatus: "Excellent" | "Good" | "Poor";
    totalTaken: number;
    totalMissed: number;
    currentStreak: number;
    activeMedicationsCount: number;
    alerts: ComplianceAlert[];
    activeMeds: any[];
    pastMeds: any[];
}

export default function MedicationCompliancePanel({ patientId }: { patientId: string }) {
    const [compliance, setCompliance] = useState<ComplianceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"active" | "past">("active");
    const [filterText, setFilterText] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    useEffect(() => {
        if (!patientId) return;

        const fetchCompliance = async () => {
            try {
                const token = Cookies.get(AUTH_COOKIE_NAME);
                const res = await axios.get(`${BASE_URL}/doctor/patient/${patientId}/compliance`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompliance(res.data.data);
            } catch (err) {
                console.error("Failed to fetch compliance", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompliance();
    }, [patientId]);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-soft flex flex-col gap-4 animate-pulse">
                <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded-xl"></div>
                <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    if (!compliance) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-soft text-center">
                <p className="text-sm text-muted">Failed to load compliance data.</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        if (status === "Excellent") return "bg-success-light text-green-700";
        if (status === "Good") return "bg-warning-light text-yellow-700";
        return "bg-danger-light text-red-700";
    };

    const getStatusIndicator = (status: string) => {
        if (status === "Excellent") return "🟢 Excellent";
        if (status === "Good") return "🟡 Good";
        return "🔴 Poor";
    };

    const pastMedsFiltered = compliance.pastMeds
        ?.filter(med => {
            const matchesText = filterText === "" || med.medicineName.toLowerCase().includes(filterText.toLowerCase());
            let matchesDate = true;
            if (filterStartDate || filterEndDate) {
                const medStart = new Date(med.startDate);
                const medEnd = med.endDate ? new Date(med.endDate) : new Date();
                
                if (filterStartDate && new Date(filterStartDate) > medEnd) matchesDate = false;
                if (filterEndDate && new Date(filterEndDate) < medStart) matchesDate = false;
            }
            return matchesText && matchesDate;
        })
        .sort((a, b) => new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime())
        .slice(0, 5) || [];

    return (
        <div className="bg-white rounded-3xl p-6 border border-soft flex flex-col h-full sticky top-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <LuActivity size={20} />
                </div>
                <div>
                    <h2 className="text-[17px] font-bold text-main">Medication Compliance</h2>
                    <p className="text-[13px] text-muted">Patient Adherence Tracking</p>
                </div>
            </div>

            {/* Alerts */}
            {compliance.alerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {compliance.alerts.map((alert, idx) => (
                        <div key={idx} className={`flex items-start gap-2 p-3 rounded-xl text-[13px] font-medium border ${
                            alert.type === 'critical' ? 'bg-danger-light text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                            <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{alert.message}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-soft p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                    <span className="text-[12px] font-medium text-muted mb-1">Adherence</span>
                    <span className="text-2xl font-black text-main">{compliance.adherencePercentage}%</span>
                    <span className={`mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(compliance.complianceStatus)}`}>
                        {getStatusIndicator(compliance.complianceStatus)}
                    </span>
                </div>
                
                <div className="bg-soft p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                    <span className="text-[12px] font-medium text-muted mb-1">Streak</span>
                    <span className="text-2xl font-black text-main">{compliance.currentStreak} <span className="text-sm font-bold text-muted">Days</span></span>
                    <div className="mt-2 text-[11px] font-bold text-orange-600 flex items-center gap-1">
                        <LuFlame size={12} /> Active
                    </div>
                </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 mb-6">
                <h3 className="text-[13px] font-bold text-blue-900 mb-3 uppercase tracking-wider">Doses History</h3>
                <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2 text-green-700">
                        <FiCheckCircle size={16} /> Taken: {compliance.totalTaken}
                    </div>
                    <div className="flex items-center gap-2 text-danger">
                        <FiAlertCircle size={16} /> Missed: {compliance.totalMissed}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 mt-4">
                <div className="flex flex-col gap-3 mb-3">
                    <div className="flex gap-2 bg-soft p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab("active")}
                            className={`flex-1 text-[12px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === "active" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-main"}`}
                        >
                            Active ({compliance.activeMedicationsCount})
                        </button>
                        <button 
                            onClick={() => setActiveTab("past")}
                            className={`flex-1 text-[12px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === "past" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-main"}`}
                        >
                            Past ({compliance.pastMeds?.length || 0})
                        </button>
                    </div>

                    {activeTab === "past" && (
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                placeholder="Search medicine name..." 
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full text-[12px] px-3 py-2 rounded-xl border border-soft outline-none focus:border-primary"
                            />
                            <DateRangeFilter
                                startDate={filterStartDate}
                                endDate={filterEndDate}
                                onStartDateChange={setFilterStartDate}
                                onEndDateChange={setFilterEndDate}
                                onReset={filterStartDate || filterEndDate ? () => { setFilterStartDate(""); setFilterEndDate(""); } : undefined}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pe-2 custom-scrollbar">
                    {activeTab === "active" ? (
                        compliance.activeMeds.length === 0 ? (
                            <p className="text-[13px] text-muted text-center mt-4">No active medications.</p>
                        ) : (
                            compliance.activeMeds.map((med, idx) => (
                                <div key={idx} className="bg-white border border-soft rounded-xl p-3 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-[14px] font-bold text-main">{med.medicineName}</h4>
                                        <span className="text-[11px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">
                                            {med.progress}%
                                        </span>
                                    </div>
                                    <div className="text-[12px] text-muted flex flex-wrap gap-x-3 gap-y-1">
                                        <span>{med.dosage}</span>
                                        <span>•</span>
                                        <span>{med.frequency}</span>
                                    </div>
                                    <div className="mt-3 h-1.5 w-full bg-soft rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${med.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        pastMedsFiltered.length === 0 ? (
                            <p className="text-[13px] text-muted text-center mt-4">No past medications found.</p>
                        ) : (
                            pastMedsFiltered.map((med, idx) => (
                                <div key={idx} className="bg-gray-50/50 border border-soft rounded-xl p-3 flex flex-col opacity-80">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-[14px] font-bold text-main line-through">{med.medicineName}</h4>
                                        <span className="text-[10px] font-bold text-muted bg-gray-100 px-2 py-0.5 rounded-md">
                                            Finished
                                        </span>
                                    </div>
                                    <div className="text-[12px] text-muted flex flex-wrap gap-x-3 gap-y-1">
                                        <span>{med.dosage}</span>
                                        <span>•</span>
                                        <span>{med.frequency}</span>
                                    </div>
                                    <div className="text-[11px] text-muted mt-2 border-t border-soft pt-2 flex justify-between">
                                        <span>Start: {new Date(med.startDate).toLocaleDateString()}</span>
                                        {med.endDate && <span>End: {new Date(med.endDate).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
