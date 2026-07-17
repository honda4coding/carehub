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
            className="p-6 transition-colors duration-300 cursor-pointer group relative h-full flex flex-col justify-between hover:border-[hsl(var(--color-primary))]"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-xl flex items-center justify-center">
                        <LuActivity size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[hsl(var(--color-text))] text-lg tracking-tight">Medication Progress</h3>
                        <p className="text-[12px] text-[hsl(var(--color-text-muted))]">Your adherence overview</p>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--color-text-muted))] group-hover:text-[hsl(var(--color-primary))] transition-colors duration-300">
                    <LuArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </div>
            </div>

            <div className="flex gap-4 mb-6 bg-[hsl(var(--color-bg-soft))] p-4 rounded-xl border border-[hsl(var(--color-border))]">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-[hsl(var(--color-text))] tracking-tighter">{summary.overallProgress}%</span>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-widest">Overall Progress</p>
                </div>
                <div className="w-px bg-[hsl(var(--color-border))]"></div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-bold text-[hsl(var(--color-primary))] tracking-tighter">{summary.adherencePercentage}%</span>
                    </div>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-widest">Adherence Rate</p>
                </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--color-text-muted))]">
                    <LuPill size={16} />
                    <span>{summary.activeMedicationsCount} Active</span>
                </div>
                
                <div className="flex gap-2">
                    {summary.currentStreak > 0 && (
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--color-warning))] bg-[hsl(var(--color-warning)/0.1)] px-2.5 py-1 rounded-md">
                            🔥 {summary.currentStreak} Day Streak
                        </div>
                    )}
                    {summary.adherencePercentage < 80 && summary.adherencePercentage > 0 && (
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.2)] px-2.5 py-1 rounded-md">
                            <FiAlertCircle size={14} /> Low Adherence
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
