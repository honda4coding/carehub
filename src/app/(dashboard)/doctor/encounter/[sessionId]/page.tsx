"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import EncounterHeader from "@/components/doctor/encounter/EncounterHeader";
import VitalsPanel from "@/components/doctor/encounter/VitalsPanel";
import MedicalAlertsPanel from "@/components/doctor/encounter/MedicalAlertsPanel";
import MedicationTracker from "@/components/doctor/encounter/MedicationTracker";
import HistoryTimeline from "@/components/doctor/encounter/HistoryTimeline";
import ClinicalAssessment from "@/components/doctor/encounter/ClinicalAssessment";
import RxBuilder from "@/components/doctor/encounter/RxBuilder";

export default function PatientDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { token } = useAuth();

  // Mode Toggles
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);
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

  const saveAlertsLocally = () => {
    setPatientData({
      ...patientData,
      allergies: editAllergies.split(",").map(s => s.trim()).filter(s => s),
      chronic: editChronic.split(",").map(s => s.trim()).filter(s => s),
      surgeries: editSurgeries.filter(s => s.operationName.trim() !== "")
    });
    setIsEditAlertsOpen(false);
  };

  // Final submission when doctor clicks End & Save
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

      <EncounterHeader 
        loading={loading}
        patientData={patientData}
        sessionData={sessionData}
        isAssessmentMode={isAssessmentMode}
        isEnding={isEnding}
        onBack={() => {
          if (isAssessmentMode) setIsAssessmentMode(false);
          else router.push("/doctor");
        }}
        onPrint={handlePrint}
        onEndSession={handleEndSession}
      />

      {/* Main Workspace */}
      <main className="print-area flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <VitalsPanel 
            loading={loading}
            patientData={patientData}
            isEditVitalsOpen={isEditVitalsOpen}
            setIsEditVitalsOpen={setIsEditVitalsOpen}
            editHeight={editHeight}
            setEditHeight={setEditHeight}
            editWeight={editWeight}
            setEditWeight={setEditWeight}
            editBloodType={editBloodType}
            setEditBloodType={setEditBloodType}
            saveVitalsLocally={saveVitalsLocally}
          />

          <MedicalAlertsPanel 
            loading={loading}
            patientData={patientData}
            isEditAlertsOpen={isEditAlertsOpen}
            setIsEditAlertsOpen={setIsEditAlertsOpen}
            editAllergies={editAllergies}
            setEditAllergies={setEditAllergies}
            editChronic={editChronic}
            setEditChronic={setEditChronic}
            editSurgeries={editSurgeries}
            setEditSurgeries={setEditSurgeries}
            saveAlertsLocally={saveAlertsLocally}
          />

          <MedicationTracker 
            activeMeds={activeMeds}
            pastMeds={pastMeds}
          />
        </div>

        {/* Right Column: Dynamic Content (9 cols) */}
        <div className="lg:col-span-9">
          {!isAssessmentMode ? (
            <HistoryTimeline 
              setIsAssessmentMode={setIsAssessmentMode}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              filterText={filterText}
              setFilterText={setFilterText}
              loadingHistory={loadingHistory}
              page={page}
              fullMedicalHistory={fullMedicalHistory}
              hasMore={hasMore}
              observerTarget={observerTarget}
            />
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <ClinicalAssessment 
                symptoms={symptoms}
                setSymptoms={setSymptoms}
                diagnosis={diagnosis}
                setDiagnosis={setDiagnosis}
                setIsAssessmentMode={setIsAssessmentMode}
              />

              <RxBuilder 
                prescriptions={prescriptions}
                setPrescriptions={setPrescriptions}
                drugName={drugName} setDrugName={setDrugName}
                dosage={dosage} setDosage={setDosage}
                frequency={frequency} setFrequency={setFrequency}
                duration={duration} setDuration={setDuration}
                instructions={instructions} setInstructions={setInstructions}
                handleAddDrug={handleAddDrug}
                removeDrug={removeDrug}
                prescriptionText={prescriptionText} setPrescriptionText={setPrescriptionText}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                previewUrl={previewUrl}
                removeFile={removeFile}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
