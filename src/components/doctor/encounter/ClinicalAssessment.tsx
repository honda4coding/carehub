import React, { useState } from "react";
import { LuClipboardList, LuX, LuMic, LuWand } from "react-icons/lu";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AIDiagnosisModal from "./AIDiagnosisModal";

interface ClinicalAssessmentProps {
  symptoms: string;
  setSymptoms: React.Dispatch<React.SetStateAction<string>>;
  diagnosis: string;
  setDiagnosis: React.Dispatch<React.SetStateAction<string>>;
  setIsAssessmentMode: (mode: boolean) => void;
}

// Handles taking the chief complaints and the final primary diagnosis
export default function ClinicalAssessment({
  symptoms,
  setSymptoms,
  diagnosis,
  setDiagnosis,
  setIsAssessmentMode
}: ClinicalAssessmentProps) {
  const [listeningTo, setListeningTo] = useState<"symptoms" | "diagnosis" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { token } = useAuth();

  const recognitionRef = typeof window !== "undefined" ? (window as any).recognitionRef || {} : {};

  const startListening = (field: "symptoms" | "diagnosis") => {
    // If already listening, stop it.
    if (listeningTo === field && recognitionRef.current) {
      recognitionRef.current.stop();
      setListeningTo(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'ar-SA'; // Default to Arabic, often works with mixed English
    recognition.interimResults = false;
    // recognition.continuous = true; // Optional: Enable this if doctors speak for a long time with pauses
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListeningTo(field);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === "symptoms") {
        setSymptoms((prev: string) => prev ? `${prev} ${transcript}` : transcript);
      } else {
        setDiagnosis((prev: string) => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone access in your browser settings to use the Dictate feature.");
      } else if (event.error === 'network') {
        alert("Network error: Voice dictation requires an active internet connection.");
      } else if (event.error !== 'aborted') { // Ignore aborted if user stops it manually
        alert(`Microphone error: ${event.error}. Please try again.`);
      }
      setListeningTo(null);
    };

    recognition.onend = () => setListeningTo(null);

    recognition.start();
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuClipboardList className="text-primary text-xl shrink-0" /> Clinical Assessment
        </h2>
        <button 
          onClick={() => setIsAssessmentMode(false)} 
          className="text-xs font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] flex items-center gap-1 no-print border border-[hsl(var(--color-border))] px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-soft))] transition-colors w-fit cursor-pointer"
        >
          <LuX /> Cancel Assessment
        </button>
      </div>
      
      <div className="space-y-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Chief Complaints / Symptoms</label>
            <button 
              onClick={() => startListening("symptoms")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all w-fit cursor-pointer ${
                listeningTo === "symptoms" 
                  ? "bg-danger-light text-danger border border-red-200 animate-pulse" 
                  : "bg-[hsl(var(--color-bg-soft))] text-primary border border-[hsl(var(--color-border))] hover:bg-primary/10"
              }`}
            >
              <LuMic className={listeningTo === "symptoms" ? "animate-bounce shrink-0" : "shrink-0"} />
              {listeningTo === "symptoms" ? "Listening..." : "Dictate"}
            </button>
          </div>
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Patient reports..."
            className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] rounded-xl px-4 py-3 text-sm font-medium focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
          />
        </div>
        
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Primary Diagnosis</label>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] cursor-pointer"
              >
                <LuWand className="shrink-0" /> AI Suggest
              </button>
              <button 
                onClick={() => startListening("diagnosis")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  listeningTo === "diagnosis" 
                    ? "bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] border border-[hsl(var(--color-danger)/0.2)] animate-pulse" 
                    : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-primary))] border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-primary)/0.1)]"
                }`}
              >
                <LuMic className={listeningTo === "diagnosis" ? "animate-bounce shrink-0" : "shrink-0"} />
                {listeningTo === "diagnosis" ? "Listening..." : "Dictate"}
              </button>
            </div>
          </div>
          <textarea 
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Bronchitis, detailed observations..."
            className="w-full h-24 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] rounded-xl px-4 py-3 text-sm font-medium focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
          />
        </div>
      </div>

      {token && (
        <AIDiagnosisModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          symptoms={symptoms}
          currentDiagnosis={diagnosis}
          sessionId={sessionId}
          token={token}
          onSelectDiagnosis={(selectedDiagnosis) => {
            setDiagnosis(diagnosis ? `${diagnosis}\n${selectedDiagnosis}` : selectedDiagnosis);
          }}
        />
      )}
    </div>
  );
}
