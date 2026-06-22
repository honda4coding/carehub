"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoIosHelpCircleOutline } from "react-icons/io";
import {
  LuUsers,
  LuCalendarDays,
  LuBell,
  LuSearch,
  LuCheck,
  LuEye,
  LuFileText,
  LuActivity,
  LuHeartPulse,
  LuClipboardList,
  LuX,
  LuShieldCheck,
  LuUserPlus,
  LuSmartphone
} from "react-icons/lu";

type SessionStatus = "pending_otp" | "in_progress" | "completed";

interface Session {
  id: string;
  patient: string;
  phone?: string;
  type: "Online" | "Walk-in";
  time: string;
  status: SessionStatus;
  initials: string;
  avatarStyle: string;
  validUntil?: number; // timestamp
}

import { CountdownTimer, OTPInput } from '@/components/doctor/dashboard/OTPComponents';
import { DoctorStats } from '@/components/doctor/dashboard/DoctorStats';
import { DoctorActions } from '@/components/doctor/dashboard/DoctorActions';
import { DashboardModals } from '@/components/doctor/dashboard/DashboardModals';
import { CurrentQueue } from '@/components/doctor/dashboard/CurrentQueue';

const INITIAL_SESSIONS: Session[] = [];

const statusConfig: Record<SessionStatus, { style: string; label: string }> = {
  pending_otp: {
    style: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
    label: "Awaiting OTP",
  },
  in_progress: {
    style: "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]",
    label: "In Progress",
  },
  completed: {
    style: "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]",
    label: "Completed",
  },
};

import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function DoctorDashboard() {
const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  
  // UI States for Modals
  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const [isWalkInModalOpen, setWalkInModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [currentOtp, setCurrentOtp] = useState<string>("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInAge, setWalkInAge] = useState("");
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [realSearchResults, setRealSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { token, user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({ totalConsultations: 0, totalPatients: 0, totalPrescriptions: 0 });

  const fetchCurrentQueue = async () => {
    if (!token) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.get(`${baseUrl}/doctor/session`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeSessions = response.data.data;
      
      const mappedSessions: Session[] = activeSessions.map((s: any) => {
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
            ? "bg-[hsl(var(--color-primary)/0.1)] text-primary"
            : "bg-[hsl(var(--color-success-bg))] text-success",
          validUntil: s.validUntil ? new Date(s.validUntil).getTime() : undefined
        };
      });
      setSessions(mappedSessions);

      // Fetch Today's stats
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const statsRes = await axios.get(`${baseUrl}/doctor/dashboard?startDate=${today.toISOString()}&endDate=${endOfDay.toISOString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardStats({ 
          totalConsultations: statsRes.data.data.totalMedicalHistories || 0,
          totalPatients: statsRes.data.data.totalPatients || 0,
          totalPrescriptions: statsRes.data.data.totalPrescriptions || 0
        });
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  useEffect(() => {
    fetchCurrentQueue();
  }, [token]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      setSearchError("Please enter at least 3 characters to search.");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setShowSearchResults(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.get(`${baseUrl}/doctor/search-patient?searchTerm=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRealSearchResults(response.data.data);

    } catch (error: any) {
      console.error("Search Error:", error);
      console.error("Backend Error Message:", error.response?.data?.message);
      setSearchError(error.response?.data?.message || "Something went wrong!");
      setRealSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filtered = sessions.filter((s) => {
    const matchText = s.patient.toLowerCase().includes(filter.toLowerCase()) || (s.phone && s.phone.includes(filter));
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    const matchType = typeFilter === "All" || s.type === typeFilter;
    return matchText && matchStatus && matchType;
  });

  const handleRequestAccess = async (patient: any) => {

    try{
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(`${baseUrl}/doctor/session/request`, {
        patientId: patient._id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      const responseData = response.data.data;
      const newSessionData = responseData.session || responseData;
      const sessionStatus: SessionStatus = newSessionData.status || "pending_otp";

      // Only show OTP alert if the session actually requires OTP verification
      if (sessionStatus === "pending_otp") {
        const tempOtp = responseData.temp_otp || response.data.temp_otp || "Not Provided";
        alert(`Test OTP for ${patient.fullName} is: ${tempOtp}`);
      } else {
        // Session is in_progress immediately — no OTP needed
        alert(`✅ تم السماح بالوصول الفوري للمريض بناءً على إعدادات الخصوصية الخاصة به.`);
      }

     const newActiveSession: Session = {
        id: newSessionData._id,
        patient: patient.fullName,
        type: "Online",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: sessionStatus,
        initials: patient.fullName.slice(0, 2).toUpperCase(),
        avatarStyle: sessionStatus === "in_progress"
          ? "bg-[hsl(var(--color-success-bg))] text-success"
          : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
        validUntil: sessionStatus === "pending_otp" && newSessionData.validUntil
          ? new Date(newSessionData.validUntil).getTime()
          : undefined,
      };



      setSessions((prev) => {
        const sessionExists = prev.find((s) => s.id === newActiveSession.id);
        if (sessionExists) {
          // Update existing session
          return prev.map((s) => s.id === newActiveSession.id ? newActiveSession : s);
        } else {
          return [newActiveSession, ...prev];
        }
      });
      
      // Refresh the queue to show the new patient!
      fetchCurrentQueue();

    } catch (err: any) {
      console.error("Error requesting session:", err);
      const msg = err.response?.data?.message;
      if (
        msg === "Session already exists for this patient" ||
        msg === "Access already granted" ||
        msg === "Access already granted for this patient"
      ) {
        // Session already active — just refresh the queue to show it
        alert("✅ هذا المريض موجود بالفعل في طابور العيادة (الجلسة نشطة).");
        fetchCurrentQueue();
      } else {
        alert("Failed to request access: " + (msg || err.message));
      }
    }
  };

  const handleCancelRequest = async (sessionId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${baseUrl}/doctor/session/${sessionId}/cancel`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSessions((prev) => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      console.error("Error canceling request:", err);
      alert(err.response?.data?.message || "Something went wrong while canceling.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!selectedSession || currentOtp.length !== 6) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${baseUrl}/doctor/session/verify`, {
        sessionId: selectedSession,
        otp: currentOtp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state to in_progress
      setSessions(prev => prev.map(s => 
        s.id === selectedSession ? { ...s, status: "in_progress", validUntil: undefined } : s
      ));

      setOTPModalOpen(false);
      setCurrentOtp("");
      
      // Optionally route to encounter page if it exists
      // router.push(`/doctor/encounter/${selectedSession}`);
      alert("OTP Verified Successfully! Patient File Unlocked.");
      
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      const msg = err.response?.data?.message;
      if (msg === "Access already granted for this patient") {
        setSessions(prev => prev.map(s => 
          s.id === selectedSession ? { ...s, status: "in_progress", validUntil: undefined } : s
        ));
        setOTPModalOpen(false);
        setCurrentOtp("");
        alert("Access already granted. Opening Patient File...");
        router.push(`/doctor/encounter/${selectedSession}`);
      } else {
        alert(msg || "Invalid or Expired OTP!");
      }
    }
  };

  const handleWalkInRegister = async () => {
    if (!walkInName.trim() || !walkInPhone.trim()) return;
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(`${baseUrl}/doctor/session/request`, {
        isOfflinePatient: true,
        guestName: walkInName,
        guestPhone: walkInPhone,
        ...(walkInAge ? { guestAge: Number(walkInAge) } : {})
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const backendSession = response.data.data;
      
      const newSession: Session = {
        id: backendSession._id,
        patient: walkInName,
        type: "Walk-in",
        time: new Date(backendSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "in_progress",
        initials: walkInName.slice(0, 2).toUpperCase(),
        phone: walkInPhone,
        avatarStyle: "bg-[hsl(var(--color-primary)/0.1)] text-primary"
      };

      setSessions(prev => [newSession, ...prev]);
      setWalkInModalOpen(false);
      setWalkInName("");
      setWalkInPhone("");
      setWalkInAge("");
      
      router.push(`/doctor/encounter/${newSession.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to register walk-in patient");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen relative min-w-0">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 truncate">
            Doctor Workspace
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0 truncate">
            Welcome back, Dr. {user?.name || (user as any)?.fullName || "Doctor"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center relative hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
            <LuBell className="text-[15px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto min-w-0 flex flex-col gap-4">
        
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
        />

        <DoctorStats dashboardStats={dashboardStats} sessions={sessions} setStatusFilter={setStatusFilter} />

        <CurrentQueue 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          filter={filter}
          setFilter={setFilter}
          filteredSessions={filtered}
          handleCancelRequest={handleCancelRequest}
          setSelectedSession={setSelectedSession}
          setOTPModalOpen={setOTPModalOpen}
        />
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
      />
    </div>
  );
}