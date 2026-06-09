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

// Dynamic Countdown Component
const CountdownTimer = ({ targetTime }: { targetTime: number }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, targetTime - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, targetTime - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  if (timeLeft === 0) return <span className="text-[hsl(var(--color-danger))]">Expired</span>;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  return <span>Expires in {minutes}:{seconds.toString().padStart(2, '0')}</span>;
};

// Smooth OTP Input Component
const OTPInput = ({ length = 6, onComplete }: { length?: number, onComplete: (otp: string) => void }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasteData.length === length) {
      onComplete(pasteData);
    }
  };

  return (
    <div className="flex gap-2 justify-center mb-6" dir="ltr">
      {otp.map((value, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-black rounded-xl border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all"
          placeholder="0"
        />
      ))}
    </div>
  );
};


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
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [realSearchResults, setRealSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { token, user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({ totalConsultations: 0 });

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

      // Fetch Lifetime stats
      try {
        const statsRes = await axios.get(`${baseUrl}/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardStats({ totalConsultations: statsRes.data.data.totalMedicalHistories || 0 });
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
      const tempOtp = responseData.temp_otp || response.data.temp_otp || "Not Provided";

      alert(`Test OTP for ${patient.fullName} is: ${tempOtp}`);

     const newActiveSession: Session = {
        id: newSessionData._id,
        patient: patient.fullName,
        type: "Online",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "pending_otp",
        initials: patient.fullName.slice(0, 2).toUpperCase(),
        avatarStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
        validUntil: new Date(newSessionData.validUntil).getTime(),
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
      if (msg === "Session already exists for this patient" || msg === "Access already granted") {
        alert("This patient is already in your active queue!");
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
        guestPhone: walkInPhone
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
      
      router.push(`/doctor/encounter/${newSession.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to register walk-in patient");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen relative">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
            Doctor Workspace
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
            Welcome back, Dr. {user?.name || (user as any)?.fullName || "Doctor"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center relative hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
            <LuBell className="text-[15px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          <button className="hidden sm:flex w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
            <IoIosHelpCircleOutline className="text-[15px]" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        
        {/* ACTION HERO SECTION - Search & Walk-in */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 h-full flex flex-col justify-center relative shadow-sm">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--color-primary)/0.05)] rounded-bl-full rounded-tr-2xl -z-10" />
               <h2 className="text-lg font-black text-[hsl(var(--color-text))] mb-1">Start New Consultation</h2>
               <p className="text-xs text-[hsl(var(--color-text-muted))] font-medium mb-4">Search for an online patient by name, phone, or ID to request access.</p>
               
               <div className="relative">
                 <div className="flex items-center border border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-bg-surface))] rounded-xl p-1 focus-within:ring-2 focus-within:ring-[hsl(var(--color-primary)/0.2)] transition-all">
                    <LuSearch className="ml-3 mr-2 text-[hsl(var(--color-primary))] text-lg" />
                    <input 
                      type="text" 
                      placeholder="e.g. 01012345678 or Mahmoud..." 
                      className="flex-1 bg-transparent border-none outline-none text-sm py-2 font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                 </div>

                  {showSearchResults && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 border-b border-[hsl(var(--color-border-soft))] bg-[hsl(var(--color-bg-soft))] flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Search Results</span>
                        <button onClick={() => setShowSearchResults(false)} className="text-[10px] text-[hsl(var(--color-danger))] font-bold">Close</button>
                      </div>
                      
                      {isSearching ? (
                        <div className="p-4 text-center text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                          Searching database...
                        </div>
                      ) : searchError ? (
                        <div className="p-4 text-center text-[12px] font-bold text-[hsl(var(--color-danger))]">
                          {searchError}
                        </div>
                      ) : (!realSearchResults || realSearchResults.length === 0) ? (
                        <div className="p-4 text-center text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                          No patients found. Try another phone or name.
                        </div>
                      ) : (
                        realSearchResults.map((patient) => (
                          <div 
                            key={patient._id} 
                            className="flex items-center justify-between p-3 hover:bg-[hsl(var(--color-bg-soft))] transition-colors border-b border-[hsl(var(--color-border-soft))]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))] flex items-center justify-center text-xs font-black uppercase">
                                {patient.fullName ? patient.fullName.slice(0, 2) : "PT"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[hsl(var(--color-text))]">{patient.fullName}</p>
                                <p className="text-xs font-medium text-[hsl(var(--color-text-muted))]">{patient.phoneNumber}</p>
                              </div>
                            </div>
                            <button className="text-[11px] font-bold bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => handleRequestAccess(patient)}
                            >
                              <LuShieldCheck className="text-[13px]" />
                              Request Access
                              
                            </button>
                          </div>
                        ))
                      )}
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-gradient-doctor rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl mb-3 backdrop-blur-sm">
                <LuUserPlus />
              </div>
              <h2 className="text-white text-lg font-black mb-1 relative z-10">Walk-In Patient</h2>
              <p className="text-white/80 text-xs font-medium mb-4 relative z-10">For patients without the app</p>
              <button 
                onClick={() => setWalkInModalOpen(true)}
                className="w-full bg-white text-primary text-sm font-bold py-2.5 rounded-xl shadow-sm hover:scale-[1.02] transition-transform relative z-10"
              >
                Register Offline Patient
              </button>
            </div>
          </div>
        </div>

        {(() => {
          const STATS = [
            {
              label: "Total Consultations",
              value: dashboardStats.totalConsultations.toString(),
              trend: "Lifetime visits",
              up: true,
              icon: <LuUsers />,
              iconStyle: "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]",
            },
            {
              label: "Active Sessions",
              value: sessions.filter(s => s.status === "in_progress").length.toString(),
              trend: "Currently in clinic",
              up: true,
              icon: <LuCalendarDays />,
              iconStyle: "bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))]",
            },
            {
              label: "Pending OTPs",
              value: sessions.filter(s => s.status === "pending_otp").length.toString(),
              trend: "Waiting for patient",
              up: false,
              icon: <LuShieldCheck />,
              iconStyle: "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]",
            },
          ];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.iconStyle}`}>
                  {s.icon}
                </div>
              </div>
              <p className="text-[24px] font-black text-[hsl(var(--color-text))]">{s.value}</p>
              <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] mt-1">{s.label}</p>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full mt-2 inline-flex ${
                  s.up ? "bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                }`}>
                {s.trend}
              </span>
            </div>
            ))}
          </div>
          );
        })()}

        {/* Sessions Table */}
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-[13px] font-black uppercase text-[hsl(var(--color-text))]">Current Queue</p>
              <p className="text-[11px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">Patients currently registered or in consultation</p>
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-[11px] font-bold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
              >
                <option value="All">All Status</option>
                <option value="pending_otp">Pending OTP</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                className="px-2 py-1.5 text-[11px] font-bold rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-muted))] outline-none cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] transition-colors"
              >
                <option value="All">All Types</option>
                <option value="Online">Online</option>
                <option value="Walk-in">Walk-in</option>
              </select>

              <div className="relative">
                <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--color-text-muted))]" />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-[11px] rounded-[8px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none font-medium text-[hsl(var(--color-text))]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  {["Patient", "Type", "Time", "Status", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className="pb-3 text-[10px] font-black uppercase tracking-[.08em] text-[hsl(var(--color-text-muted))]"
                      style={{ textAlign: i === 4 ? "right" : "left" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((s) => {
                  const sc = statusConfig[s.status];
                  return (
                    <tr key={s.id} className="border-b border-[hsl(var(--color-border-soft))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors group">
                      <td className="py-3 pl-2 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black ${s.avatarStyle}`}>
                            {s.initials}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[hsl(var(--color-text))]">{s.patient}</p>
                            <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">
                              {s.phone || "App User"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                         <span className="text-[11px] font-bold bg-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] px-2.5 py-1 rounded-md">
                           {s.type}
                         </span>
                      </td>

                      <td className="py-3 text-[12px] font-semibold text-[hsl(var(--color-text))]">
                        {s.time}
                      </td>

                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.style}`}>
                          {s.status === "pending_otp" && <LuSmartphone className="mr-1.5 text-[11px]" />}
                          {sc.label}
                        </span>
                        {s.status === "pending_otp" && s.validUntil && (
                          <div className="text-[9px] font-semibold text-[hsl(var(--color-text-muted))] mt-1.5 ml-1">
                            <CountdownTimer targetTime={s.validUntil} />
                          </div>
                        )}
                      </td>

                      <td className="py-3 pr-2 rounded-r-lg">
                        <div className="flex justify-end gap-2">
                          {s.status === "pending_otp" ? (
                            <>
                              <button 
                                onClick={() => handleCancelRequest(s.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] transition-colors"
                                title="Cancel Request"
                              >
                                <LuX className="text-[14px]" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedSession(s.id);
                                  setOTPModalOpen(true);
                                }}
                                className="text-[11px] font-bold px-4 py-1.5 rounded-lg bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] hover:opacity-80 transition-all flex items-center gap-1.5"
                              >
                                <LuShieldCheck className="text-[13px]" />
                                Enter OTP
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => router.push(`/doctor/encounter/${s.id}`)}
                              className="text-[11px] font-bold px-4 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-all flex items-center gap-1.5"
                            >
                              <LuEye className="text-[13px]" />
                              Open File
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- MODALS (UI Only) --- */}
      
      {/* OTP Verification Modal */}
      {isOTPModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-primary">
                <LuShieldCheck className="text-xl" />
                <h3 className="font-black text-[hsl(var(--color-text))]">Secure Access Handshake</h3>
              </div>
              <button onClick={() => setOTPModalOpen(false)} className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors">
                <LuX className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                   <LuSmartphone className="text-3xl text-primary" />
                </div>
                <h4 className="text-lg font-black text-[hsl(var(--color-text))]">Enter Patient OTP</h4>
                <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mt-1">
                  We've sent a 6-digit code to <strong className="text-[hsl(var(--color-text))]">Mahmoud Hassan</strong>.
                  Ask the patient for the code to securely access their file.
                </p>
              </div>
              
              <OTPInput 
                length={6} 
                onComplete={(val) => setCurrentOtp(val)} 
              />

              <button 
                onClick={handleVerifyOTP}
                disabled={currentOtp.length !== 6}
                className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-opacity shadow-[0_4px_12px_hsl(var(--color-primary)/0.25)] ${currentOtp.length === 6 ? 'bg-primary hover:opacity-90' : 'bg-primary/50 cursor-not-allowed'}`}
              >
                Verify & Open File
                <LuCheck className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-In Registration Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-gradient-doctor">
              <div className="flex items-center gap-2 text-white">
                <LuUserPlus className="text-xl" />
                <h3 className="font-black">Walk-in Patient</h3>
              </div>
              <button onClick={() => setWalkInModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <LuX className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-5">
                Register a quick session for an offline patient. They won't need to verify an OTP.
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Patient Name</label>
                  <input 
                    type="text" 
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                    placeholder="e.g. Ahmed Ali" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                    placeholder="010..." 
                  />
                </div>
              </div>

              <button 
                onClick={handleWalkInRegister}
                disabled={!walkInName.trim() || !walkInPhone.trim()}
                className={`w-full text-[hsl(var(--color-bg-surface))] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-opacity ${walkInName.trim() && walkInPhone.trim() ? 'bg-[hsl(var(--color-text))] hover:opacity-90' : 'bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed'}`}
              >
                Start Consultation Session
                <LuCheck className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}