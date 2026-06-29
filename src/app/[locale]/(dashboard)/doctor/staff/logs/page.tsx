"use client";

import { useState, useEffect } from "react";
import { fetchClient } from "@/services/fetchClient";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LuArrowLeft, LuClock, LuUser } from "react-icons/lu";
import { useTranslations } from "next-intl";

export default function StaffLogsPage() {
    const t = useTranslations("auto");
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetchClient.get("/doctor/staff/logs");
                setLogs(res.data?.data || []);
            } catch (err) {
                console.error("Failed to load logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader 
                title={t('activityLogs')} 
                subtitle="Monitor all actions performed by your clinic staff"
                rightElement={
                    <Button variant="secondary" size="sm" href="/doctor/staff" icon={LuArrowLeft}>
                        {t('backToStaff')}</Button>
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
                                    {t('noActivityLogsFound')}</div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log._id} className="flex items-start gap-4 p-4 border border-[hsl(var(--color-border))] rounded-xl bg-[hsl(var(--color-bg-soft))]">
                                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0">
                                            <LuUser size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-[hsl(var(--color-text))]">
                                                {log.assistantId?.fullName || "Unknown Staff"} 
                                                <span className="text-[hsl(var(--color-text-muted))] font-normal ms-2">{t('performedAction')}</span>
                                                <span className="ms-2 text-[hsl(var(--color-primary))] uppercase">{log.action}</span>
                                            </p>
                                            
                                            {Object.keys(log.details || {}).length > 0 && (
                                                <pre className="mt-2 text-xs bg-[hsl(var(--color-bg))] p-2 rounded-lg text-[hsl(var(--color-text-muted))] overflow-x-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                        <div className="text-xs text-[hsl(var(--color-text-muted))] flex items-center gap-1 whitespace-nowrap shrink-0">
                                            <LuClock size={12} /> {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
