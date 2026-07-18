"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/global/DashboardHeader";
import { CurrentQueue } from "@/components/doctor/dashboard/CurrentQueue";
import { fetchClient } from "@/services/fetchClient";
import VitalsModal from "@/components/assistant/VitalsModal";

export default function AssistantVitalsPage() {
  const { user } = useAuth();
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
            time: s.order && s.order > 0 ? new Date(s.order).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            queueTime: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            scheduledTime: s.order && s.order > 0 ? new Date(s.order).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
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
      } catch (err) {
        console.error("Failed to fetch queue data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleReorder = async (draggedId: string, targetId: string) => {
    try {
      const reordered = [...sessions];
      const draggedIndex = reordered.findIndex(s => s.id === draggedId);
      const targetIndex = reordered.findIndex(s => s.id === targetId);
      
      const [dragged] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, dragged);
      
      setSessions(reordered);

      const payload = reordered.map((s, idx) => ({ id: s.id, order: idx }));
      await fetchClient.patch("/doctor/session/reorder", { sessions: payload });
    } catch (err) {
      console.error("Failed to reorder", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))]">
      <DashboardHeader title="Update Vitals" subtitle="Record vitals for patients in the queue" />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <CurrentQueue 
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            filter={filter}
            setFilter={setFilter}
            filteredSessions={filteredSessions}
            handleReorder={handleReorder}
            isAssistant={true}
            onRecordVitals={(patient: any) => {
              setSelectedPatientForVitals(patient);
              setIsVitalsModalOpen(true);
            }}
            hideAssessmentAction={true} // Only show vitals
            hideFees={true}
          />
        </div>
      </main>

      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patient={selectedPatientForVitals}
        onSuccess={() => setIsVitalsModalOpen(false)}
      />
    </div>
  );
}
