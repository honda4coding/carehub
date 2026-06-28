"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/global/DashboardHeader";
import { DoctorStats } from "@/components/doctor/dashboard/DoctorStats";
import { CurrentQueue } from "@/components/doctor/dashboard/CurrentQueue";
import { fetchClient } from "@/services/fetchClient";

export default function AssistantDashboard() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({ totalConsultations: 0, totalPatients: 0, totalPrescriptions: 0 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch overall stats (generic dashboard spoofed to doctor)
        const statsRes = await fetchClient.get(`/doctor/dashboard?startDate=${today.toISOString()}&endDate=${endOfDay.toISOString()}`);
        setDashboardStats({
          totalConsultations: statsRes?.data?.totalMedicalHistories || 0,
          totalPatients: statsRes?.data?.totalPatients || 0,
          totalPrescriptions: statsRes?.data?.totalPrescriptions || 0
        });

        // Only fetch queue/sessions if they have appointment permissions
        if (user?.permissions?.canManageAppointments) {
          const sessionRes = await fetchClient.get(`/doctor/session`);
          const activeSessions = sessionRes?.data || [];
          
          const mappedSessions = activeSessions.map((s: any) => {
            let name = s.isOfflinePatient ? s.guestName : s.patientId?.fullName || "Unknown";
            let phone = s.isOfflinePatient ? s.guestPhone : s.patientId?.phoneNumber || "N/A";
            return {
              id: s._id,
              patient: name,
              type: s.isOfflinePatient ? "Walk-in" : "Online",
              time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: s.status,
              initials: name.slice(0, 2).toUpperCase(),
              phone: phone,
              avatarStyle: s.isOfflinePatient 
                ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]"
                : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
              validUntil: s.validUntil ? new Date(s.validUntil).getTime() : undefined
            };
          });
          setSessions(mappedSessions);
        }
      } catch (err) {
        console.error("Failed to fetch assistant dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-[hsl(var(--color-text-muted))]">Loading Dashboard...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader 
        title="Assistant Dashboard" 
        subtitle={`Welcome back, ${user?.name}`} 
      />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <DoctorStats dashboardStats={dashboardStats} sessions={sessions} />
          
          {user?.permissions?.canManageAppointments && (
            <div className="mt-8">
              <CurrentQueue 
                sessions={sessions} 
                filter="" 
                statusFilter="All" 
                typeFilter="All" 
                onStatusChange={() => {}} 
                onStartSession={() => {}} 
                onCancelSession={() => {}} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
