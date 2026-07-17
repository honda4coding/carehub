"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LuUser, LuHistory, LuStethoscope, LuPill, LuX } from "react-icons/lu";
import { calculateAge } from "@/utils/ageUtils";

import EncounterHeader from "@/components/doctor/encounter/EncounterHeader";
import VitalsPanel from "@/components/doctor/encounter/VitalsPanel";
import MedicalAlertsPanel from "@/components/doctor/encounter/MedicalAlertsPanel";
import PastSurgeriesPanel from "@/components/doctor/encounter/PastSurgeriesPanel";
import MedicationCompliancePanel from "@/components/doctor/encounter/MedicationCompliancePanel";
import HistoryTimeline from "@/components/doctor/encounter/HistoryTimeline";
import ClinicalAssessment from "@/components/doctor/encounter/ClinicalAssessment";
import RxBuilder from "@/components/doctor/encounter/RxBuilder";
import DoctorVitalsCharts from "@/components/doctor/encounter/DoctorVitalsCharts";
import PatientInsightsCard from "@/components/doctor/encounter/PatientInsightsCard";

import ProfileTab from "@/components/doctor/encounter/tabs/ProfileTab";
import HistoryTab from "@/components/doctor/encounter/tabs/HistoryTab";
import AssessmentTab from "@/components/doctor/encounter/tabs/AssessmentTab";
import PrescriptionTab from "@/components/doctor/encounter/tabs/PrescriptionTab";

export default function PatientDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { token, user, role } = useAuth();
  const canManagePatientsFull = role === "doctor" || (role === "assistant" && user?.permissions?.canManagePatientsFull);

  // Tab Navigation
  const [activeTab, setActiveTab] = useState<"profile" | "history" | "assessment" | "prescription">("profile");
  const [filterText, setFilterText] = useState("");

  // Patient & Session Data
  const [patientData, setPatientData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [fullMedicalHistory, setFullMedicalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  // Pagination & History Filter
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Medication States
  const [activeMeds, setActiveMeds] = useState<any[]>([]);
  const [pastMeds, setPastMeds] = useState<any[]>([]);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Assessment States
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  
  // Follow-up State
  const [followUpDate, setFollowUpDate] = useState("");
  
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

  // Attachments Upload
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsMetadata, setAttachmentsMetadata] = useState<{ type: string; title: string }[]>([]);
  const attachmentsInputRef = useRef<HTMLInputElement>(null);

  // Edit Vitals Modal
  const [isEditVitalsOpen, setIsEditVitalsOpen] = useState(false);
  const [isEditAlertsOpen, setIsEditAlertsOpen] = useState(false);
  const [isEditSurgeriesOpen, setIsEditSurgeriesOpen] = useState(false);
  const [isSavingAlerts, setIsSavingAlerts] = useState(false);
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editBloodType, setEditBloodType] = useState("");
  const [editBloodPressure, setEditBloodPressure] = useState("");
  const [editSugarLevel, setEditSugarLevel] = useState("");
  const [editPulse, setEditPulse] = useState("");
  const [editTemperature, setEditTemperature] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editChronic, setEditChronic] = useState("");
  const [editSurgeries, setEditSurgeries] = useState<{ operationName: string, surgeonName?: string, date?: string, report?: string }[]>([]);

  // Fetch session and medication history on load
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
                age: currentSession.patientProfile?.dateOfBirth ? calculateAge(currentSession.patientProfile.dateOfBirth).toString() : (currentSession.patientProfile?.age?.toString() || "--"),
                bloodType: currentSession.patientProfile?.bloodType || "-",
                height: currentSession.patientProfile?.height || "-",
                weight: currentSession.patientProfile?.weight || "-",
                allergies: currentSession.patientProfile?.allergies || [],
                chronic: currentSession.patientProfile?.chronic || [],
                surgeries: currentSession.patientProfile?.surgeries || []
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
        queryParams.append('scope', 'global');
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

  // Handle adding new prescriptions locally
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

  // Handle prescription image upload
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

  // Update vitals locally without hitting the API yet
  const saveVitalsLocally = () => {
    setPatientData({
      ...patientData,
      height: editHeight || "-",
      weight: editWeight || "-",
      bloodType: editBloodType || "-"
    });
    setIsEditVitalsOpen(false);
  };

  const saveAlerts = async () => {
    if (!token || !sessionData || sessionData.isOfflinePatient) return;
    setIsSavingAlerts(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const allergiesArr = editAllergies.split(",").map(s => s.trim()).filter(s => s);
      const chronicArr = editChronic.split(",").map(s => s.trim()).filter(s => s);

      await axios.patch(`${baseUrl}/doctor/patient/${sessionData.patientId._id}/alerts`, {
        allergies: allergiesArr,
        chronic: chronicArr
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPatientData({
        ...patientData,
        allergies: allergiesArr,
        chronic: chronicArr
      });
      setIsEditAlertsOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save alerts");
    } finally {
      setIsSavingAlerts(false);
    }
  };

  const saveSurgeries = async () => {
    if (!token || !sessionData || sessionData.isOfflinePatient) return;
    setIsSavingAlerts(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const surgeriesArr = editSurgeries.filter(s => s.operationName.trim() !== "");

      await axios.patch(`${baseUrl}/doctor/patient/${sessionData.patientId._id}/alerts`, {
        surgeries: surgeriesArr
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPatientData({
        ...patientData,
        surgeries: surgeriesArr
      });
      setIsEditSurgeriesOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save surgeries");
    } finally {
      setIsSavingAlerts(false);
    }
  };

  const handleCancelSession = async () => {
    if (!token || !sessionId) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this session without diagnosing? This action cannot be undone.");
    if (!confirmCancel) return;
    
    setIsEnding(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.delete(`${baseUrl}/doctor/session/${sessionId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Session cancelled successfully.");
      router.push("/doctor");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel session");
      setIsEnding(false);
    }
  };

  // Final submission when doctor clicks End & Save
  const handleEndSession = async (fees: number) => {
    if (!token) return;
    setIsEnding(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const formData = new FormData();
      if (fees > 0) formData.append("fees", fees.toString());
      formData.append("diagnosis", diagnosis);
      formData.append("notes", symptoms);
      formData.append("prescriptionText", prescriptionText);
      formData.append("height", editHeight);
      formData.append("weight", editWeight);
      formData.append("bloodType", editBloodType);
      formData.append("bloodPressure", editBloodPressure);
      formData.append("sugarLevel", editSugarLevel);
      formData.append("pulse", editPulse);
      formData.append("temperature", editTemperature);
      if (followUpDate) formData.append("followUpDays", followUpDate);

      let medsToSave = prescriptions.map(p => ({
        medicineName: p.medicineName,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions
      }));

      // Auto-add any un-added prescription input if the doctor forgot to click "Add"
      if (drugName && dosage && frequency && duration) {
        medsToSave.push({
          medicineName: drugName,
          dosage,
          frequency,
          duration,
          instructions
        });
      }

      if (medsToSave.length > 0) {
        formData.append("medications", JSON.stringify(medsToSave));
      }

      if (prescriptionFile) {
        formData.append("prescriptionImage", prescriptionFile);
      }

      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append("attachments", file);
        });
        formData.append("attachmentsMetadata", JSON.stringify(attachmentsMetadata));
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

  const lastVisitWithVitals = fullMedicalHistory?.find(record => 
    record.bloodPressure || record.sugarLevel || record.pulse || record.temperature
  );

  const lastVisitVitals = lastVisitWithVitals ? {
    date: lastVisitWithVitals.createdAt,
    bloodPressure: lastVisitWithVitals.bloodPressure,
    sugarLevel: lastVisitWithVitals.sugarLevel,
    pulse: lastVisitWithVitals.pulse,
    temperature: lastVisitWithVitals.temperature,
  } : undefined;

  if (!loading && !sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(var(--color-bg-base))] p-4 text-center">
        <div className="bg-[hsl(var(--color-bg-surface))] p-8 rounded-2xl border border-[hsl(var(--color-border))] max-w-md w-full shadow-sm flex flex-col items-center">
          <LuX className="text-5xl text-[hsl(var(--color-danger))] mb-4 bg-red-500/10 p-2 rounded-full" />
          <h2 className="text-xl font-bold text-[hsl(var(--color-text))] mb-2">Session Not Available</h2>
          <p className="text-[13px] text-[hsl(var(--color-text-muted))] mb-6 leading-relaxed">
            This session may have already been completed, cancelled, or doesn't exist. You cannot enter a closed session.
          </p>
          <button 
            onClick={() => router.push("/doctor")} 
            className="w-full bg-[hsl(var(--color-primary))] text-white text-[14px] font-bold py-2.5 rounded-xl shadow-[0_4px_12px_hsl(var(--color-primary)/0.25)] hover:scale-[1.02] transition-transform"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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

      {!loading && !sessionData ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <LuStethoscope className="text-5xl text-[hsl(var(--color-text-muted))] mb-4 opacity-50" />
          <h2 className="text-2xl font-black text-[hsl(var(--color-text))] mb-2">Session Not Found or Ended</h2>
          <p className="text-[hsl(var(--color-text-muted))] mb-6 max-w-md">
            This session has already been completed, cancelled, or it does not exist. You can no longer edit its details.
          </p>
          <button 
            onClick={() => router.push("/doctor")} 
            className="bg-[hsl(var(--color-primary))] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:scale-105 transition-transform"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <>
          <EncounterHeader 
        loading={loading}
        patientData={patientData}
        sessionData={sessionData}
        isAssessmentMode={activeTab !== "profile" && activeTab !== "history"}
        isEnding={isEnding}
        onBack={() => {
          if (activeTab !== "history") setActiveTab("history");
          else router.push("/doctor");
        }}
        onPrint={handlePrint}
        onEndSession={handleEndSession}
        onCancelSession={handleCancelSession}
      />

      {/* Main Workspace */}
      <main className="print-area flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* Tab Navigation */}
        <div className="mb-6 w-full no-print flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-[hsl(var(--color-bg-surface))] p-1.5 rounded-2xl border border-[hsl(var(--color-border))] w-full lg:w-auto">
            {[
              { id: "profile", label: "Profile & Vitals", icon: LuUser },
              { id: "history", label: "Medical History", icon: LuHistory },
              ...(canManagePatientsFull ? [
                { id: "assessment", label: "Clinical Assessment", icon: LuStethoscope },
                { id: "prescription", label: "Prescription", icon: LuPill }
              ] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-2 px-3 md:px-5 py-2.5 rounded-xl text-[12px] md:text-sm font-bold transition-all flex-1 sm:flex-none min-w-[130px] sm:min-w-0 cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-[hsl(var(--color-primary))] text-white " 
                    : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))]"
                }`}
              >
                <tab.icon className="text-base md:text-lg shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Areas */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          
          {/* TAB 1: Profile & Vitals */}
          {activeTab === "profile" && (
            <ProfileTab 
              loading={loading}
              patientData={patientData}
              fullMedicalHistory={fullMedicalHistory}
              isEditVitalsOpen={isEditVitalsOpen} setIsEditVitalsOpen={setIsEditVitalsOpen}
              editHeight={editHeight} setEditHeight={setEditHeight}
              editWeight={editWeight} setEditWeight={setEditWeight}
              editBloodPressure={editBloodPressure} setEditBloodPressure={setEditBloodPressure}
              editSugarLevel={editSugarLevel} setEditSugarLevel={setEditSugarLevel}
              editPulse={editPulse} setEditPulse={setEditPulse}
              editTemperature={editTemperature} setEditTemperature={setEditTemperature}
              editBloodType={editBloodType} setEditBloodType={setEditBloodType}
              saveVitalsLocally={saveVitalsLocally}
              lastVisitVitals={lastVisitVitals}
              isEditAlertsOpen={isEditAlertsOpen} setIsEditAlertsOpen={setIsEditAlertsOpen}
              editAllergies={editAllergies} setEditAllergies={setEditAllergies}
              editChronic={editChronic} setEditChronic={setEditChronic}
              saveAlerts={saveAlerts}
              isEditSurgeriesOpen={isEditSurgeriesOpen} setIsEditSurgeriesOpen={setIsEditSurgeriesOpen}
              editSurgeries={editSurgeries} setEditSurgeries={setEditSurgeries}
              saveSurgeries={saveSurgeries}
              isSavingAlerts={isSavingAlerts}
            />
          )}

          {/* TAB 2: Medical History */}
          {activeTab === "history" && (
            <HistoryTab 
              sessionData={sessionData}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              filterText={filterText} setFilterText={setFilterText}
              loadingHistory={loadingHistory}
              page={page}
              fullMedicalHistory={fullMedicalHistory}
              hasMore={hasMore}
              observerTarget={observerTarget}
              setIsAssessmentMode={() => setActiveTab("assessment")}
            />
          )}

          {/* TAB 3: Clinical Assessment */}
          {activeTab === "assessment" && (
            <AssessmentTab 
              symptoms={symptoms} setSymptoms={setSymptoms}
              diagnosis={diagnosis} setDiagnosis={setDiagnosis}
              setIsAssessmentMode={() => setActiveTab("history")}
              onProceedToPrescription={() => setActiveTab("prescription")}
            />
          )}

          {/* TAB 4: Prescription */}
          {activeTab === "prescription" && (
            <PrescriptionTab 
              prescriptions={prescriptions} setPrescriptions={setPrescriptions}
              drugName={drugName} setDrugName={setDrugName}
              dosage={dosage} setDosage={setDosage}
              frequency={frequency} setFrequency={setFrequency}
              duration={duration} setDuration={setDuration}
              patientComplaint={diagnosis}
              patientId={sessionData?.patientId?._id || sessionData?.patientId}
              allergies={patientData?.allergies || []}
              chronic={patientData?.chronic || []}
              surgeries={patientData?.surgeries || []}
              instructions={instructions} setInstructions={setInstructions}
              handleAddDrug={handleAddDrug}
              removeDrug={removeDrug}
              prescriptionText={prescriptionText} setPrescriptionText={setPrescriptionText}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              previewUrl={previewUrl}
              removeFile={removeFile}
              attachments={attachments} setAttachments={setAttachments}
              attachmentsMetadata={attachmentsMetadata} setAttachmentsMetadata={setAttachmentsMetadata}
              attachmentsInputRef={attachmentsInputRef}
              followUpDate={followUpDate} setFollowUpDate={setFollowUpDate}
            />
          )}
          
        </div>
      </main>
        </>
      )}
    </div>
  );
}
