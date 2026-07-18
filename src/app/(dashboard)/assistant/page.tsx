"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/global/DashboardHeader";
import { DoctorStats } from "@/components/doctor/dashboard/DoctorStats";
import { CurrentQueue } from "@/components/doctor/dashboard/CurrentQueue";
import { fetchClient } from "@/services/fetchClient";
import VitalsModal from "@/components/assistant/VitalsModal";
import { useRouter } from "next/navigation";
import { DoctorActions } from '@/components/doctor/dashboard/DoctorActions';
import { DashboardModals } from '@/components/doctor/dashboard/DashboardModals';

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

  const router = useRouter();

  // Search & Walk-in State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [realSearchResults, setRealSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  const [isWalkInModalOpen, setWalkInModalOpen] = useState(false);
  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const [currentOtp, setCurrentOtp] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInAge, setWalkInAge] = useState("");

  const fetchCurrentQueue = async () => {
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
                isFeesFinalized: s.isFeesFinalized || false,
                avatarStyle: s.isOfflinePatient 
                  ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]"
                  : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
                validUntil: s.validUntil ? new Date(s.validUntil).getTime() : undefined
              };
            });
            setSessions(mappedSessions);
          } catch (err) {
            console.error("Failed to fetch current queue", err);
          }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      setSearchError("Please enter at least 3 characters to search.");
      return;
    }
    setIsSearching(true);
    setSearchError("");
    setShowSearchResults(true);
    try {
      const response = await fetchClient.get(`/doctor/search-patient?searchTerm=${searchQuery}`, { skipClinicContext: true });
      setRealSearchResults(response.data || []);
    } catch (error: any) {
      setSearchError(error.message || "Something went wrong!");
      setRealSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const [isExistingPatientModalOpen, setExistingPatientModalOpen] = useState(false);
  const [selectedPatientForQueue, setSelectedPatientForQueue] = useState<any>(null);

  const handleRequestAccess = (patient: any) => {
    setSelectedPatientForQueue(patient);
    setExistingPatientModalOpen(true);
  };

  const handleExistingPatientQueueEntry = async (selectedSlot: string, skipQueue: boolean) => {
    if (!selectedPatientForQueue) return;
    try{
      const responseData = await fetchClient.post(`/doctor/session/request`, { 
        patientId: selectedPatientForQueue._id,
        appointmentId: selectedSlot || undefined,
        skipQueue
      });
      const newSessionData = responseData.data?.session || responseData.data || responseData;
      const sessionStatus = newSessionData.status || "pending_otp";
      if (sessionStatus === "pending_otp") {
        alert("✅ An OTP has been sent via Push Notification to the patient's phone. Please ask the patient for the code to complete the session.");
      } else {
        alert(`✅ Instant access granted to the patient based on their privacy settings.`);
      }
      fetchCurrentQueue();
      setExistingPatientModalOpen(false);
      setSelectedPatientForQueue(null);
    } catch (err: any) {
      const msg = err.message;
      if (msg === "Session already exists for this patient" || msg === "Access already granted" || msg === "Access already granted for this patient") {
        alert("✅ This patient is already in the clinic queue (Active Session).");
        fetchCurrentQueue();
        setExistingPatientModalOpen(false);
        setSelectedPatientForQueue(null);
      } else {
        alert("Failed to request access: " + msg);
      }
    }
  };

  const handleCancelRequest = async (sessionId: string) => {
    try {
      await fetchClient.delete(`/doctor/session/${sessionId}/cancel`);
      setSessions((prev) => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      alert(err.message || "Something went wrong while canceling.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!selectedSession || currentOtp.length !== 6) return;
    try {
      await fetchClient.post(`/doctor/session/verify`, { sessionId: selectedSession, otp: currentOtp });
      setSessions(prev => prev.map(s => s.id === selectedSession ? { ...s, status: "in_progress", validUntil: undefined } : s));
      setOTPModalOpen(false);
      setCurrentOtp("");
      alert("OTP Verified Successfully! Patient File Unlocked.");
    } catch (err: any) {
      const msg = err.message;
      if (msg === "Access already granted for this patient") {
        setSessions(prev => prev.map(s => s.id === selectedSession ? { ...s, status: "in_progress", validUntil: undefined } : s));
        setOTPModalOpen(false);
        setCurrentOtp("");
        alert("Access already granted. Opening Patient File...");
      } else {
        alert(msg || "Invalid or Expired OTP!");
      }
    }
  };

  const handleWalkInRegister = async (selectedSlot: string, skipQueue: boolean) => {
    if (!walkInName.trim() || !walkInPhone.trim()) return;
    try {
      await fetchClient.post(`/doctor/session/request`, {
        isOfflinePatient: true,
        guestName: walkInName,
        guestPhone: walkInPhone,
        appointmentId: selectedSlot || undefined,
        skipQueue,
        ...(walkInAge ? { guestAge: Number(walkInAge) } : {})
      });
      fetchCurrentQueue();
      setWalkInModalOpen(false);
      setWalkInName("");
      setWalkInPhone("");
      setWalkInAge("");
      alert("Walk-in patient registered successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to register walk-in patient");
    }
  };

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
            type: s.isOfflinePatient ? "Walk-in" : (s.isOfflineEntry ? "Offline" : "Online"),
            time: s.order && s.order > 0 ? new Date(s.order).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            queueTime: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            scheduledTime: s.order && s.order > 0 ? new Date(s.order).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            status: s.status,
            initials: name.slice(0, 2).toUpperCase(),
            phone: phone,
            order: s.order || 0,
            fees: s.fees || 0,
            avatarStyle: (s.isOfflinePatient || s.isOfflineEntry)
              ? "bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]"
              : "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
            validUntil: s.validUntil ? new Date(s.validUntil).getTime() : undefined
          };
        });
        setSessions(mappedSessions);
      } catch (err) {
        console.error("Failed to fetch assistant dashboard data", err);
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

  const handleUpdateFees = async (sessionId: string, fees: number, isFeesFinalized: boolean = false) => {
    try {
      await fetchClient.patch(`/doctor/session/${sessionId}/fees`, { fees, isFeesFinalized });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, fees, isFeesFinalized } : s));
      alert("Fees updated successfully.");
    } catch (err: any) {
      console.error("Failed to update fees", err);
      alert(err.message || "Failed to update fees");
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
            <div className="flex flex-col gap-6 mt-8">
              <DoctorActions 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                isSearching={isSearching}
                showSearchResults={showSearchResults}
                setShowSearchResults={setShowSearchResults}
                searchError={searchError}
                realSearchResults={realSearchResults}
                handleRequestAccess={handleRequestAccess}
                setWalkInModalOpen={setWalkInModalOpen}
                user={user}
              />
              <CurrentQueue 
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                filter={filter}
                setFilter={setFilter}
                filteredSessions={filteredSessions}
                handleCancelRequest={handleCancelRequest}
                setSelectedSession={setSelectedSession}
                setOTPModalOpen={setOTPModalOpen}
                handleReorder={handleReorder}
                handleUpdateFees={handleUpdateFees}
                isAssistant={role === "assistant"}
                onRecordVitals={(session: any) => {
                  setSelectedPatientForVitals(session);
                  setIsVitalsModalOpen(true);
                }}
                hideVitalsAction={!user?.permissions?.canManagePatientsVitals && !user?.permissions?.canManagePatientsFull}
                hideAssessmentAction={true}
                hideFees={!user?.permissions?.canManageBilling}
              />
            </div>
          )}
        </div>
      </main>

      <DashboardModals 
        isOTPModalOpen={isOTPModalOpen}
        setOTPModalOpen={setOTPModalOpen}
        isWalkInModalOpen={isWalkInModalOpen}
        setWalkInModalOpen={setWalkInModalOpen}
        currentOtp={currentOtp}
        setCurrentOtp={setCurrentOtp}
        handleVerifyOTP={handleVerifyOTP}
        walkInName={walkInName}
        setWalkInName={setWalkInName}
        walkInPhone={walkInPhone}
        setWalkInPhone={setWalkInPhone}
        walkInAge={walkInAge}
        setWalkInAge={setWalkInAge}
        handleWalkInRegister={handleWalkInRegister}
        isExistingPatientModalOpen={isExistingPatientModalOpen}
        setExistingPatientModalOpen={setExistingPatientModalOpen}
        handleExistingPatientQueueEntry={handleExistingPatientQueueEntry}
        selectedExistingPatient={selectedPatientForQueue}
      />
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
