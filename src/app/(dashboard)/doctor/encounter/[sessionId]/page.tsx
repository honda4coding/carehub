"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LuActivity,
  LuArrowLeft,
  LuClipboardList,
  LuClock,
  LuDroplet,
  LuFileText,
  LuHistory,
  LuImage, LuPen,
  LuPill,
  LuPlus,
  LuPrinter,
  LuRuler,
  LuSave,
  LuStethoscope,
  LuTrash2,
  LuTriangleAlert,
  LuUpload,
  LuWeight,
  LuX
} from "react-icons/lu";

export default function PatientDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { token } = useAuth();

  // Mode Toggle
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);
  const [filterText, setFilterText] = useState("");

  // Data States
  const [patientData, setPatientData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [fullMedicalHistory, setFullMedicalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Medication States
  const [activeMeds, setActiveMeds] = useState<any[]>([]);
  const [pastMeds, setPastMeds] = useState<any[]>([]);

  const observerTarget = useRef(null);

  // Assessment States
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  
  // Rx Builder State
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  // Prescription Upload
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Vitals Modal
  const [isEditVitalsOpen, setIsEditVitalsOpen] = useState(false);
  const [isEditAlertsOpen, setIsEditAlertsOpen] = useState(false);
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editBloodType, setEditBloodType] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editChronic, setEditChronic] = useState("");
  const [editSurgeries, setEditSurgeries] = useState<{ operationName: string, surgeonName?: string, date?: string, report?: string }[]>([]);

  useEffect(() => {
    const fetchSessionAndMeds = async () => {
      if (!token) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await axios.get(`${baseUrl}/doctor/session`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const sessions = response.data.data;
        const currentSession = sessions.find((s: any) => s._id === sessionId);
        
        if (currentSession) {
          setSessionData(currentSession);
          const pData = currentSession.isOfflinePatient 
            ? { name: currentSession.guestName, age: "--", bloodType: "-", height: "-", weight: "-", allergies: [], chronic: [], surgeries: [] }
            : {
                name: currentSession.patientId?.fullName,
                age: "--",
                bloodType: currentSession.patientId?.bloodType || "-",
                height: currentSession.patientId?.height || "-",
                weight: currentSession.patientId?.weight || "-",
                allergies: currentSession.patientId?.allergies || [],
                chronic: currentSession.patientId?.chronic || [],
                surgeries: currentSession.patientId?.surgeries || []
              };
          setPatientData(pData);
          setEditHeight(pData.height === "-" ? "" : pData.height);
          setEditWeight(pData.weight === "-" ? "" : pData.weight);
          setEditBloodType(pData.bloodType === "-" ? "" : pData.bloodType);
          setEditAllergies(pData.allergies.join(", "));
          setEditChronic(pData.chronic.join(", "));
          setEditSurgeries(pData.surgeries || []);

          // Fetch Medications Tracker
          try {
            const query = currentSession.isOfflinePatient 
              ? `?isOfflinePatient=true&guestName=${encodeURIComponent(currentSession.guestName)}&guestPhone=${encodeURIComponent(currentSession.guestPhone || '')}`
              : `?patientId=${currentSession.patientId._id}`;
            const medsRes = await axios.get(`${baseUrl}/doctor/medications/history${query}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setActiveMeds(medsRes.data.data.activeMeds || []);
            setPastMeds(medsRes.data.data.pastMeds || []);
          } catch (err) {
            console.error("Failed to fetch medications tracker", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndMeds();
  }, [sessionId, token]);

  const fetchHistory = async (isLoadMore = false) => {
    if (!token || !sessionData || loadingHistory) return;
    if (isLoadMore && !hasMore) return;

    setLoadingHistory(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const queryParams = new URLSearchParams();
      
      if (sessionData.isOfflinePatient) {
        queryParams.append('isOfflinePatient', 'true');
        queryParams.append('guestName', sessionData.guestName);
        if (sessionData.guestPhone) queryParams.append('guestPhone', sessionData.guestPhone);
      } else {
        queryParams.append('patientId', sessionData.patientId._id);
      }

      queryParams.append('page', page.toString());
      queryParams.append('limit', '10');
      if (filterText) queryParams.append('search', filterText);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const res = await axios.get(`${baseUrl}/doctor/patient/history?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { history, pagination } = res.data.data;
      
      if (isLoadMore) {
        setFullMedicalHistory(prev => [...prev, ...history]);
      } else {
        setFullMedicalHistory(history);
      }
      
      setHasMore(pagination.page < pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Debounced Filter & Fetch History Effect
  useEffect(() => {
    if (!sessionData) return;
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchHistory(false);
      } else {
        setPage(1); // Will trigger the page effect
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filterText, startDate, endDate, sessionData]);

  // Pagination Effect
  useEffect(() => {
    if (!sessionData || page === 1) return;
    fetchHistory(true);
  }, [page, sessionData]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingHistory) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loadingHistory]);

  const handleAddDrug = () => {
    if (!drugName || !dosage || !frequency || !duration) {
      alert("Please fill Drug Name, Dosage, Frequency, and Duration");
      return;
    }
    const newDrug = {
      id: Math.random().toString(36).substring(2, 9),
      medicineName: drugName,
      dosage,
      frequency,
      duration,
      instructions
    };
    setPrescriptions([...prescriptions, newDrug]);
    setDrugName(""); setDosage(""); setFrequency(""); setDuration(""); setInstructions("");
  };

  const removeDrug = (id: string) => {
    setPrescriptions(prescriptions.filter(d => d.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrescriptionFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setPrescriptionFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveVitalsLocally = () => {
    setPatientData({
      ...patientData,
      height: editHeight || "-",
      weight: editWeight || "-",
      bloodType: editBloodType || "-"
    });
    setIsEditVitalsOpen(false);
  };

  const saveAlertsLocally = () => {
    setPatientData({
      ...patientData,
      allergies: editAllergies.split(",").map(s => s.trim()).filter(s => s),
      chronic: editChronic.split(",").map(s => s.trim()).filter(s => s),
      surgeries: editSurgeries.filter(s => s.operationName.trim() !== "")
    });
    setIsEditAlertsOpen(false);
  };

  const handleEndSession = async () => {
    if (!token) return;
    setIsEnding(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const formData = new FormData();
      formData.append("diagnosis", diagnosis);
      formData.append("notes", symptoms);
      formData.append("prescriptionText", prescriptionText);
      formData.append("height", editHeight);
      formData.append("weight", editWeight);
      formData.append("bloodType", editBloodType);
      
      const allergiesArr = editAllergies.split(",").map(s => s.trim()).filter(s => s);
      const chronicArr = editChronic.split(",").map(s => s.trim()).filter(s => s);
      const surgeriesArr = editSurgeries.filter(s => s.operationName.trim() !== "");
      formData.append("allergies", JSON.stringify(allergiesArr));
      formData.append("chronic", JSON.stringify(chronicArr));
      formData.append("surgeries", JSON.stringify(surgeriesArr));

      const medsToSave = prescriptions.map(p => ({
        medicineName: p.medicineName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions
      }));
      formData.append("medications", JSON.stringify(medsToSave));

      if (prescriptionFile) {
        formData.append("prescriptionImage", prescriptionFile);
      }

      await axios.patch(`${baseUrl}/doctor/session/${sessionId}/end`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      alert("Session ended successfully. Medical History saved.");
      router.push("/doctor");

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to end session");
      setIsEnding(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };



  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Header */}
      <header className="no-print sticky top-0 z-30 bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (isAssessmentMode) setIsAssessmentMode(false);
              else router.push("/doctor");
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
          >
            <LuArrowLeft className="text-xl text-[hsl(var(--color-text))]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))]">
                {loading ? "Loading Patient..." : patientData?.name}
              </h1>
              {sessionData?.status === 'in_progress' && (
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                  In Clinic
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="hidden md:flex items-center gap-2 text-sm font-bold bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] px-4 py-2.5 rounded-xl border border-[hsl(var(--color-border))] transition-colors">
            <LuPrinter /> Print Report
          </button>
          {isAssessmentMode && (
            <button onClick={handleEndSession} disabled={isEnding} className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_12px_hsl(var(--color-primary)/0.25)] hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50">
              {isEnding ? "Saving..." : <><LuSave className="text-lg" /> End & Save</>}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="print-area flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm relative group">
            <h3 className="text-sm font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-4 uppercase tracking-wider">
              <LuActivity className="text-primary" /> Patient Vitals
            </h3>
            <button onClick={() => setIsEditVitalsOpen(true)} className="no-print absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
              <LuPen />
            </button>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
                <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuRuler/> Height</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.height} cm</span>
              </div>
              <div className="flex justify-between items-center bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
                <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuWeight/> Weight</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.weight} kg</span>
              </div>
              <div className="flex justify-between items-center bg-[hsl(var(--color-bg-soft))] px-3 py-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
                <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuDroplet className="text-red-500" /> Blood</span>
                <span className="text-sm font-black text-[hsl(var(--color-text))]">{loading ? "--" : patientData?.bloodType}</span>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--color-danger)/0.05)] border border-[hsl(var(--color-danger)/0.1)] rounded-2xl p-5 shadow-sm relative group">
            <h3 className="text-sm font-black text-[hsl(var(--color-danger))] flex items-center gap-2 mb-4 uppercase tracking-wider">
              <LuTriangleAlert /> Medical Alerts
            </h3>
            <button onClick={() => setIsEditAlertsOpen(true)} className="no-print absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-danger)/0.5)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[hsl(var(--color-danger))]">
              <LuPen />
            </button>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {!loading && patientData?.allergies?.length > 0 ? patientData.allergies.map((a: string, i: number) => <span key={`${a}-${i}`} className="bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] text-[11px] font-bold px-2 py-1 rounded-md">{a}</span>) : <span className="text-xs text-[hsl(var(--color-text-muted))]">None reported</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1 mt-3">Chronic</p>
                <div className="flex flex-wrap gap-2">
                  {!loading && patientData?.chronic?.length > 0 ? patientData.chronic.map((c: string, i: number) => <span key={`${c}-${i}`} className="bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))] text-[11px] font-bold px-2 py-1 rounded-md">{c}</span>) : <span className="text-xs text-[hsl(var(--color-text-muted))]">None reported</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[hsl(var(--color-danger)/0.7)] uppercase mb-1 mt-3">Operations</p>
                <div className="flex flex-wrap gap-2">
                  {!loading && patientData?.surgeries?.length > 0 ? patientData.surgeries.map((s: any, i: number) => (
                    <div key={`${s.operationName}-${i}`} className="group/tooltip relative">
                      <span className="bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] text-[11px] font-bold px-2 py-1 rounded-md cursor-help border border-[hsl(var(--color-primary)/0.2)]">
                        {s.operationName}
                      </span>
                      {/* Tooltip */}
                      {(s.date || s.report) && (
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2.5 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                          {s.surgeonName && <p className="text-[10px] font-bold text-[hsl(var(--color-text))] mb-1">Surgeon: {s.surgeonName}</p>}
                          {s.date && <p className="text-[10px] font-bold text-[hsl(var(--color-primary))] mb-1">{s.date}</p>}
                          {s.report && <p className="text-[10px] text-[hsl(var(--color-text-muted))] whitespace-pre-wrap">{s.report}</p>}
                        </div>
                      )}
                    </div>
                  )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">None reported</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Automated Medication Tracker */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm relative group space-y-5">
            <div>
              <h3 className="text-sm font-black text-[hsl(var(--color-success))] flex items-center gap-2 mb-3 uppercase tracking-wider">
                <LuPill /> Active Medications
              </h3>
              <div className="space-y-2">
                {activeMeds.length > 0 ? activeMeds.map((med: any, idx: number) => (
                  <div key={idx} className="bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success))/0.2] p-2.5 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold text-[hsl(var(--color-success))]">{med.name} <span className="text-[10px] opacity-80">{med.dosage}</span></p>
                      {med.isLifelong && <span className="bg-[hsl(var(--color-success))] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Lifelong</span>}
                    </div>
                    <p className="text-[10px] font-medium text-[hsl(var(--color-success))/0.7] mt-0.5">Prescribed: {med.date} by Dr. {med.doctorId}</p>
                  </div>
                )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">None active</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-[hsl(var(--color-text-muted))] flex items-center gap-2 mb-3 uppercase tracking-wider">
                <LuHistory /> Past Medications
              </h3>
              <div className="space-y-2">
                {pastMeds.length > 0 ? pastMeds.slice(0, 3).map((med: any, idx: number) => (
                  <div key={idx} className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border-soft))] p-2.5 rounded-lg opacity-75 grayscale">
                    <p className="text-[11px] font-bold text-[hsl(var(--color-text))]">{med.name} <span className="text-[10px] text-[hsl(var(--color-text-muted))]">{med.dosage}</span></p>
                    <p className="text-[9px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">Ended. Prescribed {med.date}</p>
                  </div>
                )) : <span className="text-xs text-[hsl(var(--color-text-muted))]">No past history</span>}
                {pastMeds.length > 3 && <p className="text-[10px] text-center font-bold text-[hsl(var(--color-text-muted))]">+ {pastMeds.length - 3} more</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Content (9 cols) */}
        <div className="lg:col-span-9">
          
          {!isAssessmentMode ? (
            /* ========================================================= */
            /* MEDICAL HISTORY TIMELINE VIEW (DEFAULT)                   */
            /* ========================================================= */
            <div className="space-y-6">
              
              {/* Start Assessment CTA */}
              <div className="bg-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.15)] rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 no-print">
                <div>
                  <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-2 flex items-center gap-2">
                    <LuStethoscope className="text-primary text-2xl" /> Ready for today's visit?
                  </h2>
                  <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] max-w-lg">
                    Review the patient's medical history below. When you're ready to start the clinical assessment and prescribe new medications, enter the assessment mode.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAssessmentMode(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl shadow-[0_8px_16px_hsl(var(--color-primary)/0.2)] hover:shadow-[0_8px_24px_hsl(var(--color-primary)/0.3)] hover:-translate-y-1 transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <LuPlus className="text-xl" /> Start Assessment
                </button>
              </div>

              {/* Full Timeline */}
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-[hsl(var(--color-border))] pb-4">
                  <h3 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                    <LuHistory className="text-primary text-xl" /> Full Medical History
                  </h3>
                  <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-end gap-2">
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase text-[hsl(var(--color-text-muted))] ml-1 mb-0.5">Start</label>
                        <input 
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full sm:w-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-3 py-2 text-xs font-medium focus:border-primary outline-none text-[hsl(var(--color-text-muted))]"
                          title="Start Date"
                        />
                      </div>
                      <span className="text-[hsl(var(--color-border))] pb-2">-</span>
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase text-[hsl(var(--color-text-muted))] ml-1 mb-0.5">End</label>
                        <input 
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full sm:w-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-3 py-2 text-xs font-medium focus:border-primary outline-none text-[hsl(var(--color-text-muted))]"
                          title="End Date"
                        />
                      </div>
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <input 
                        type="text"
                        placeholder="Search doctor, diagnosis..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full sm:w-56 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2 text-xs font-medium focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                {loadingHistory && page === 1 ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[hsl(var(--color-border))] border-t-primary animate-spin"></div></div>
                ) : fullMedicalHistory.length > 0 ? (
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[hsl(var(--color-border))] before:to-transparent">
                    {fullMedicalHistory.map((record: any, index: number) => (
                      <div key={record._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Timeline dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[hsl(var(--color-bg-surface))] bg-[hsl(var(--color-primary)/0.1)] text-primary font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                          <LuFileText />
                        </div>
                        {/* Timeline Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[hsl(var(--color-bg-soft))] p-5 rounded-2xl border border-[hsl(var(--color-border))] hover:border-primary/30 transition-colors shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1"><LuClock /> {new Date(record.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] font-bold bg-[hsl(var(--color-primary)/0.1)] text-primary px-2 py-1 rounded-md">Dr. {record.doctorId?.fullName || 'Unknown'}</span>
                          </div>
                          
                          <h4 className="text-sm font-black text-[hsl(var(--color-text))] mb-2">Diagnosis: {record.diagnosis || "General Visit"}</h4>
                          
                          {record.notes && (
                            <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mb-4 bg-[hsl(var(--color-bg-base))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                              <span className="font-bold text-[hsl(var(--color-text))] block mb-1">Symptoms:</span>
                              {record.notes}
                            </p>
                          )}

                          {/* Render Prescriptions inline */}
                          {record.prescriptions && record.prescriptions.length > 0 && (
                            <div className="mt-4 border-t border-[hsl(var(--color-border-soft))] pt-3">
                              <h5 className="text-[11px] font-bold text-[hsl(var(--color-text))] flex items-center gap-1 mb-2"><LuPill className="text-[hsl(var(--color-secondary-strong))]" /> Medications Prescribed</h5>
                              <div className="space-y-2">
                                {record.prescriptions.map((rx: any) => 
                                  rx.medications?.map((med: any, mIdx: number) => (
                                    <div key={mIdx} className="bg-[hsl(var(--color-bg-base))] p-2 rounded-lg border border-[hsl(var(--color-border-soft))]">
                                      <h6 className="text-[11px] font-bold text-[hsl(var(--color-text))]">{med.medicineName}</h6>
                                      <p className="text-[10px] text-[hsl(var(--color-text-muted))]">{med.dosage} • {med.frequency} • {med.duration}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {record.prescriptionText && (
                            <div className="mt-3 bg-[hsl(var(--color-bg-base))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
                              <p className="text-[10px] font-bold text-[hsl(var(--color-text))] mb-1">Rx Notes:</p>
                              <p className="text-[11px] text-[hsl(var(--color-text-muted))]">{record.prescriptionText}</p>
                            </div>
                          )}
                          
                          {record.documents && record.documents.length > 0 && (
                            <div className="mt-3">
                              {record.documents.filter((d:any) => d.type === "prescription").map((doc: any, dIdx: number) => (
                                <a key={dIdx} href={doc.secure_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline bg-[hsl(var(--color-primary)/0.05)] px-3 py-1.5 rounded-lg border border-[hsl(var(--color-primary)/0.1)]">
                                  <LuImage /> View Scanned Rx
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Infinite Scroll Observer Target */}
                    {hasMore && (
                      <div ref={observerTarget} className="flex justify-center py-6 w-full z-10 relative">
                        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--color-border))] border-t-primary animate-spin"></div>
                      </div>
                    )}
                    {!hasMore && fullMedicalHistory.length > 0 && (
                      <div className="text-center py-4 text-xs font-bold text-[hsl(var(--color-text-muted))] relative z-10 bg-[hsl(var(--color-bg-surface))] inline-block px-4 mx-auto md:left-1/2 md:-translate-x-1/2 rounded-full border border-[hsl(var(--color-border-soft))]">
                        End of history.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl">
                    <LuHistory className="text-4xl text-[hsl(var(--color-border-soft))] mx-auto mb-3" />
                    <p className="text-base font-bold text-[hsl(var(--color-text))] mb-1">No Medical History</p>
                    <p className="text-sm font-medium text-[hsl(var(--color-text-muted))]">This appears to be the patient's first visit.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* CLINICAL ASSESSMENT MODE                                  */
            /* ========================================================= */
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Diagnosis Section */}
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                    <LuClipboardList className="text-primary text-xl" /> Clinical Assessment
                  </h2>
                  <button onClick={() => setIsAssessmentMode(false)} className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] flex items-center gap-1 no-print border border-[hsl(var(--color-border))] px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-soft))] transition-colors">
                    <LuX /> Cancel Assessment
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Chief Complaints / Symptoms</label>
                    <textarea 
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Patient reports..."
                      className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Primary Diagnosis</label>
                    <textarea 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Bronchitis, detailed observations..."
                      className="w-full h-24 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Rx Builder Section */}
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
                    <LuPill className="text-primary text-xl" /> Prescription (Rx)
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 p-4 bg-[hsl(var(--color-bg-soft))] rounded-xl border border-[hsl(var(--color-border-soft))] no-print">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Drug Name</label>
                    <input value={drugName} onChange={e=>setDrugName(e.target.value)} type="text" placeholder="e.g. Amoxicillin" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Dosage</label>
                    <input value={dosage} onChange={e=>setDosage(e.target.value)} type="text" placeholder="500mg" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Frequency</label>
                    <input value={frequency} onChange={e=>setFrequency(e.target.value)} type="text" placeholder="1x3" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))]">Duration</label>
                      <label className="flex items-center gap-1 cursor-pointer text-[9px] font-bold text-[hsl(var(--color-primary))] uppercase">
                        <input type="checkbox" checked={duration.toLowerCase() === "lifelong"} onChange={(e) => setDuration(e.target.checked ? "Lifelong" : "")} className="accent-primary w-3 h-3" />
                        Lifelong
                      </label>
                    </div>
                    <input disabled={duration.toLowerCase() === "lifelong"} value={duration} onChange={e=>setDuration(e.target.value)} type="text" placeholder="5 days" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors disabled:opacity-50" />
                  </div>
                  <div className="md:col-span-5 mt-2">
                    <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Instructions (Optional)</label>
                    <input value={instructions} onChange={e=>setInstructions(e.target.value)} type="text" placeholder="e.g. After meals" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
                  </div>
                  <div className="flex items-end mt-2 md:col-span-1">
                    <button onClick={handleAddDrug} className="w-full bg-[hsl(var(--color-secondary)/0.1)] text-[hsl(var(--color-secondary-strong))] hover:bg-[hsl(var(--color-secondary)/0.2)] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                      <LuPlus /> Add
                    </button>
                  </div>
                </div>

                {prescriptions.length > 0 ? (
                  <div className="space-y-3 print-area">
                    <h3 className="text-sm font-bold text-[hsl(var(--color-text))] mb-2 hidden print:block">Prescribed Medications</h3>
                    {prescriptions.map((drug) => (
                      <div key={drug.id} className="flex items-center justify-between p-3 border border-[hsl(var(--color-border))] rounded-xl hover:border-primary/50 transition-colors group bg-[hsl(var(--color-bg-soft))]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-primary">
                            <LuPill />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[hsl(var(--color-text))]">{drug.medicineName} <span className="text-xs font-semibold text-[hsl(var(--color-text-muted))] ml-2">{drug.dosage}</span></h4>
                            <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mt-0.5">{drug.frequency} for {drug.duration}</p>
                            {drug.instructions && <p className="text-[11px] text-[hsl(var(--color-primary))] mt-0.5 font-semibold">{drug.instructions}</p>}
                          </div>
                        </div>
                        <button onClick={() => removeDrug(drug.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[hsl(var(--color-danger)/0.5)] hover:bg-[hsl(var(--color-danger)/0.1)] hover:text-[hsl(var(--color-danger))] transition-colors no-print">
                          <LuTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl no-print">
                    <LuPill className="text-3xl text-[hsl(var(--color-border-soft))] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">No medications prescribed yet.</p>
                  </div>
                )}
              </div>

              {/* Upload Rx Section */}
              <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm no-print">
                <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-5">
                  <LuImage className="text-primary text-xl" /> Alternatively: Upload Paper Prescription
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mb-4">
                      If you prefer to write on paper, simply snap a photo and upload it here instead of typing the drugs above.
                    </p>
                    
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!previewUrl ? (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed border-[hsl(var(--color-border))] hover:border-primary hover:bg-[hsl(var(--color-primary)/0.02)] rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-bg-soft))] group-hover:bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-[hsl(var(--color-text-muted))] group-hover:text-primary transition-colors">
                          <LuUpload className="text-xl" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-[hsl(var(--color-text))]">Click to upload photo</p>
                          <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      </button>
                    ) : (
                      <div className="relative w-full h-40 border border-[hsl(var(--color-border))] rounded-xl overflow-hidden group">
                        <img src={previewUrl} alt="Prescription" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button onClick={() => fileInputRef.current?.click()} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                            <LuPen />
                          </button>
                          <button onClick={removeFile} className="bg-[hsl(var(--color-danger)/0.8)] hover:bg-[hsl(var(--color-danger))] text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
                            <LuTrash2 />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Or Type Quick Notes</label>
                     <textarea 
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder="Additional notes for the pharmacy or patient..."
                      className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Edit Vitals Modal */}
      {isEditVitalsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setIsEditVitalsOpen(false)} className="absolute top-6 right-6 text-[hsl(var(--color-text-muted))] hover:text-danger transition-colors">
              <LuX className="text-2xl" />
            </button>
            <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-6 flex items-center gap-2">
              <LuPen className="text-primary" /> Edit Patient Vitals
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Height (cm)</label>
                  <input type="text" value={editHeight || ""} onChange={(e) => setEditHeight(e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Weight (kg)</label>
                  <input type="text" value={editWeight || ""} onChange={(e) => setEditWeight(e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Blood Type</label>
                <select value={editBloodType || ""} onChange={(e) => setEditBloodType(e.target.value)} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                  <option value="">Unknown / Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <button onClick={saveVitalsLocally} className="w-full mt-4 bg-primary text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-transform">
                Save Vitals to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Alerts Modal */}
      {isEditAlertsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print">
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setIsEditAlertsOpen(false)} className="absolute top-6 right-6 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors">
              <LuX className="text-2xl" />
            </button>
            <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-6 flex items-center gap-2">
              <LuPen className="text-[hsl(var(--color-danger))]" /> Edit Medical Alerts
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Allergies (comma separated)</label>
                <input type="text" value={editAllergies || ""} onChange={(e) => setEditAllergies(e.target.value)} placeholder="e.g. Peanuts, Penicillin" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Chronic Diseases (comma separated)</label>
                <input type="text" value={editChronic || ""} onChange={(e) => setEditChronic(e.target.value)} placeholder="e.g. Diabetes, Hypertension" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
              </div>

              <div className="border-t border-[hsl(var(--color-border-soft))] pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[hsl(var(--color-text))]">Previous Surgeries</label>
                  <button onClick={() => setEditSurgeries([...editSurgeries, { operationName: "", surgeonName: "", date: "", report: "" }])} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                    <LuPlus /> Add Surgery
                  </button>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {editSurgeries.map((surgery, idx) => (
                    <div key={idx} className="bg-[hsl(var(--color-bg-soft))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))] relative">
                      <button onClick={() => {
                        const newS = [...editSurgeries];
                        newS.splice(idx, 1);
                        setEditSurgeries(newS);
                      }} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[hsl(var(--color-danger)/0.7)] hover:text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] rounded-md transition-colors">
                        <LuTrash2 size={12} />
                      </button>
                      
                      <div className="space-y-2 pr-6">
                        <input type="text" value={surgery.operationName} onChange={(e) => {
                          const newS = [...editSurgeries];
                          newS[idx].operationName = e.target.value;
                          setEditSurgeries(newS);
                        }} placeholder="Operation Name (e.g. Appendectomy)" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-1.5 text-xs focus:border-primary outline-none" />
                        
                        <input type="text" value={surgery.surgeonName || ""} onChange={(e) => {
                          const newS = [...editSurgeries];
                          newS[idx].surgeonName = e.target.value;
                          setEditSurgeries(newS);
                        }} placeholder="Surgeon Name (e.g. Dr. Ahmed)" className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-1.5 text-xs focus:border-primary outline-none" />
                        
                        <input type="date" value={surgery.date || ""} onChange={(e) => {
                          const newS = [...editSurgeries];
                          newS[idx].date = e.target.value;
                          setEditSurgeries(newS);
                        }} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-1.5 text-xs focus:border-primary outline-none" />
                        
                        <textarea value={surgery.report || ""} onChange={(e) => {
                          const newS = [...editSurgeries];
                          newS[idx].report = e.target.value;
                          setEditSurgeries(newS);
                        }} placeholder="Report / Details (Optional)" rows={2} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] rounded-lg px-3 py-1.5 text-xs focus:border-primary outline-none resize-none" />
                      </div>
                    </div>
                  ))}
                  {editSurgeries.length === 0 && (
                    <p className="text-[11px] text-center text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-base))] p-3 rounded-lg border border-dashed border-[hsl(var(--color-border))]">No surgeries added. Click 'Add Surgery' to begin.</p>
                  )}
                </div>
              </div>

              <button onClick={saveAlertsLocally} className="w-full mt-4 bg-[hsl(var(--color-danger))] text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-transform">
                Save Alerts to Dashboard
              </button>
              <p className="text-[10px] text-center text-[hsl(var(--color-text-muted))] mt-2">These details will be permanently saved when you End & Save the session.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
