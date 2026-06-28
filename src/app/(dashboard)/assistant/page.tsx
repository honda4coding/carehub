"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/global/DashboardHeader";
import { DoctorStats } from "@/components/doctor/dashboard/DoctorStats";
import { CurrentQueue } from "@/components/doctor/dashboard/CurrentQueue";
import { fetchClient } from "@/services/fetchClient";
import VitalsModal from "@/components/assistant/VitalsModal";

export default function AssistantDashboard() {
  const { user, role } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({ totalConsultations: 0, totalPatients: 0, totalPrescriptions: 0 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<any>(null);

  // Filters for CurrentQueue
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [filter, setFilter] = useState("");

  const filteredSessions = sessions.filter((s: any) => {
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    const matchType = typeFilter === "All" || s.type === typeFilter;
    const matchSearch =
      s.patient.toLowerCase().includes(filter.toLowerCase()) ||
      (s.phone && s.phone.includes(filter));
    return matchStatus && matchType && matchSearch;
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch overall stats
        const statsRes = await fetchClient.get(`/doctor/dashboard?startDate=${today.toISOString()}&endDate=${endOfDay.toISOString()}`);
        setDashboardStats({
          totalConsultations: statsRes?.data?.totalMedicalHistories || 0,
          totalPatients: statsRes?.data?.totalPatients || 0,
          totalPrescriptions: statsRes?.data?.totalPrescriptions || 0
        });

        if (user?.permissions?.canManageAppointments) {
          const sessionRes = await fetchClient.get(`/doctor/session`);
          const completedRes = await fetchClient.get(`/doctor/session?status=completed`);
          
          const activeSessions = sessionRes?.data || [];
          const completedSessions = completedRes?.data || [];
          
          const mappedSessions = [...activeSessions, ...completedSessions].map((s: any) => {
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
              order: s.order || 0,
              fees: s.fees || 0,
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

  const handleReorder = async (sessionId: string, newOrder: number) => {
    try {
      const allSessions = sessions.map(s => ({ id: s.id, order: s.order }));
      const targetSession = allSessions.find(s => s.id === sessionId);
      if (targetSession) {
        targetSession.order = newOrder;
        await fetchClient.patch("/doctor/session/reorder", { sessions: allSessions });
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, order: newOrder } : s));
      }
    } catch (err) {
      console.error("Failed to reorder", err);
    }
  };

  const handleUpdateFees = async (sessionId: string, fees: number) => {
    try {
      await fetchClient.patch(`/doctor/session/${sessionId}/fees`, { fees });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, fees } : s));
    } catch (err) {
      console.error("Failed to update fees", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[hsl(var(--color-text-muted))]">Loading Dashboard...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--color-bg-base))]">
      <DashboardHeader 
        title={user?.jobTitle ? `${user.jobTitle} Dashboard` : "Assistant Workspace"} 
        subtitle={
          user?.doctorName && user?.clinicName 
            ? `Assisting Dr. ${user.doctorName} at ${user.clinicName}`
            : user?.doctorName 
              ? `Assisting Dr. ${user.doctorName}`
              : `Welcome back, ${user?.name}`
        } 
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <DoctorStats dashboardStats={dashboardStats} sessions={sessions} />
          
          {user?.permissions?.canManageAppointments && (
            <div className="mt-8">
              <CurrentQueue 
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                filter={filter}
                setFilter={setFilter}
                filteredSessions={filteredSessions}
                handleCancelRequest={() => {}}
                setSelectedSession={() => {}}
                setOTPModalOpen={() => {}}
                handleReorder={handleReorder}
                handleUpdateFees={handleUpdateFees}
                isAssistant={role === "assistant"}
                onRecordVitals={(session: any) => {
                  setSelectedPatientForVitals(session);
                  setIsVitalsModalOpen(true);
                }}
              />
            </div>
          )}
        </div>
      </main>

      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patient={selectedPatientForVitals}
        onSuccess={() => {
          alert('Vitals recorded successfully');
        }}
      />
    </div>
  );
}
