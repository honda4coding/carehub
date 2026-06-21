"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { useRouter } from "next/navigation";
import { LuActivity, LuArrowRight, LuPill } from "react-icons/lu";
import { FiAlertCircle } from "react-icons/fi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface MedSummary {
    activeMedicationsCount: number;
    overallProgress: number;
    adherencePercentage: number;
    totalTaken: number;
    totalMissed: number;
    currentStreak: number;
}

export default function MedicationSummaryWidget() {
    const [summary, setSummary] = useState<MedSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchSummary() {
            try {
                const token = Cookies.get(AUTH_COOKIE_NAME);
                if (!token) return;
                
                const { data } = await axios.get(`${BASE_URL}/patient/medications/summary`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setSummary(data.data);
            } catch (err) {
                console.error("Failed to load medication summary", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
        );
    }

    if (!summary || summary.activeMedicationsCount === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 flex items-center justify-center rounded-full mb-3">
                    <LuPill size={24} />
                </div>
                <h3 className="text-gray-800 font-bold mb-1">Medications</h3>
                <p className="text-[13px] text-gray-500 mb-4">You have no active medications.</p>
            </div>
        );
    }

    return (
        <div 
            onClick={() => router.push("/patient/tracking/medications")}
            className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <LuActivity size={18} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-[15px]">Medication Progress</h3>
                </div>
                <button className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <LuArrowRight size={18} />
                </button>
            </div>

            <div className="flex gap-4 relative z-10">
                <div className="flex-1">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-black text-gray-800">{summary.overallProgress}%</span>
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium">Overall Progress</p>
                </div>
                <div className="w-[1px] bg-gray-100"></div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-2xl font-black text-blue-600">{summary.adherencePercentage}%</span>
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium">Adherence Rate</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600">
                    <LuPill size={14} className="text-gray-400" />
                    <span>{summary.activeMedicationsCount} Active</span>
                </div>
                
                {summary.currentStreak > 0 && (
                    <div className="flex items-center gap-1 text-[12px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                        🔥 {summary.currentStreak} Day Streak
                    </div>
                )}
                {summary.adherencePercentage < 80 && summary.adherencePercentage > 0 && (
                    <div className="flex items-center gap-1 text-[12px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                        <FiAlertCircle size={12} /> Low Adherence
                    </div>
                )}
            </div>
        </div>
    );
}
