"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { useRouter } from "next/navigation";
import { LuActivity, LuArrowRight, LuPill } from "react-icons/lu";
import { FiAlertCircle } from "react-icons/fi";
import { Card } from "@/components/ui/Card";

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
            <Card className="p-5 animate-pulse">
                <div className="h-6 w-32 bg-[hsl(var(--color-bg-soft))] rounded mb-4"></div>
                <div className="h-20 bg-[hsl(var(--color-bg-soft))] rounded-xl"></div>
            </Card>
        );
    }

    if (!summary || summary.activeMedicationsCount === 0) {
        return (
            <Card 
                className="p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                onClick={() => router.push("/patient/tracking/medications")}
            >
                <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center rounded-full mb-3">
                    <LuPill size={32} />
                </div>
                <h3 className="text-[hsl(var(--color-text))] font-bold text-lg mb-1">Medications</h3>
                <p className="text-sm text-[hsl(var(--color-text-muted))] mb-4">You have no active medications.</p>
                <div className="text-[hsl(var(--color-primary))] text-sm font-bold flex items-center gap-1 mt-2">
                    View Medication History <LuArrowRight />
                </div>
            </Card>
        );
    }

    return (
        <Card 
            onClick={() => router.push("/patient/tracking/medications")}
            className="p-5 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--color-primary)/0.05)] rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center">
                        <LuActivity size={20} />
                    </div>
                    <h3 className="font-bold text-[hsl(var(--color-text))] text-lg">Medication Progress</h3>
                </div>
                <button className="text-[hsl(var(--color-primary))] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <LuArrowRight size={20} />
                </button>
            </div>

            <div className="flex gap-4 relative z-10">
                <div className="flex-1">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black text-[hsl(var(--color-text))]">{summary.overallProgress}%</span>
                    </div>
                    <p className="text-sm text-[hsl(var(--color-text-muted))] font-medium">Overall Progress</p>
                </div>
                <div className="w-[1px] bg-[hsl(var(--color-border))]"></div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black text-[hsl(var(--color-primary))]">{summary.adherencePercentage}%</span>
                    </div>
                    <p className="text-sm text-[hsl(var(--color-text-muted))] font-medium">Adherence Rate</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))] flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--color-text-muted))]">
                    <LuPill size={16} />
                    <span>{summary.activeMedicationsCount} Active</span>
                </div>
                
                <div className="flex gap-2">
                    {summary.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-[13px] font-bold text-[hsl(var(--color-warning))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] px-2.5 py-1 rounded-md">
                            🔥 {summary.currentStreak} Day Streak
                        </div>
                    )}
                    {summary.adherencePercentage < 80 && summary.adherencePercentage > 0 && (
                        <div className="flex items-center gap-1 text-[13px] font-bold text-[hsl(var(--color-danger))] bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] px-2.5 py-1 rounded-md">
                            <FiAlertCircle size={14} /> Low Adherence
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
