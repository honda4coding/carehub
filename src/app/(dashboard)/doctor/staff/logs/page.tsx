"use client";

import { useState, useEffect } from "react";
import { fetchClient } from "@/services/fetchClient";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LuArrowLeft, LuClock, LuUser, LuExternalLink } from "react-icons/lu";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";

export default function StaffLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await fetchClient.get(`/doctor/staff/logs?page=${page}&limit=10`);
                setLogs(res.data || []);
                setTotalPages(res.pages || 1);
            } catch (err) {
                console.error("Failed to load logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [page]);

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader 
                title="Activity Logs" 
                subtitle="Monitor all actions performed by your clinic staff"
                rightElement={
                    <Button variant="secondary" size="sm" href="/doctor/staff" icon={LuArrowLeft}>
                        Back to Staff
                    </Button>
                }
            />

            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Card className="p-6">
                        <div className="space-y-4">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 bg-[hsl(var(--color-bg-soft))] rounded-xl animate-pulse" />)
                            ) : logs.length === 0 ? (
                                <div className="text-center py-10 text-[hsl(var(--color-text-muted))]">
                                    No activity logs found.
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log._id} className="flex items-start gap-4 p-4 border border-[hsl(var(--color-border))] rounded-xl bg-[hsl(var(--color-bg-soft))]">
                                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0">
                                            <LuUser size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-[hsl(var(--color-text))]">
                                                {log.assistantId?.fullName || "Unknown Staff"} 
                                                <span className="text-[hsl(var(--color-text-muted))] font-normal ml-2">performed action:</span>
                                                <span className="ml-2 text-[hsl(var(--color-primary))] uppercase">{log.action}</span>
                                            </p>
                                            
                                            {Object.keys(log.details || {}).length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {Object.entries(log.details).map(([key, value]) => {
                                                        if (key === 'patientId') return null;
                                                        if (key === 'sessionId' && log.details.patientName) return null;

                                                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                                        
                                                        if (key === 'patientName' && log.details.patientId) {
                                                            return (
                                                                <div key={key} className="flex items-center gap-1.5 text-[11px] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] px-2 py-1 rounded-md shadow-sm">
                                                                    <span className="text-[hsl(var(--color-text-muted))] font-medium">{label}:</span>
                                                                    <Link href={`/doctor/history/${log.details.patientId}`} className="text-[hsl(var(--color-primary))] hover:underline font-bold flex items-center gap-1">
                                                                        {String(value)} <LuExternalLink size={10} />
                                                                    </Link>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={key} className="flex items-center gap-1.5 text-[11px] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] px-2 py-1 rounded-md shadow-sm">
                                                                <span className="text-[hsl(var(--color-text-muted))] font-medium">{label}:</span>
                                                                <span className="text-[hsl(var(--color-text))] font-bold">
                                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-[hsl(var(--color-text-muted))] flex items-center gap-1 whitespace-nowrap shrink-0">
                                            <LuClock size={12} /> {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}

                            {!loading && totalPages > 1 && (
                                <div className="mt-8">
                                    <Pagination 
                                        currentPage={page} 
                                        totalPages={totalPages} 
                                        onPageChange={(p) => setPage(p)} 
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
