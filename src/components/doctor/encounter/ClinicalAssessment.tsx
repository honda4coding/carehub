import { useState } from "react";
import { LuClipboardList, LuX, LuMic } from "react-icons/lu";

interface ClinicalAssessmentProps {
  symptoms: string;
  setSymptoms: (text: string) => void;
  diagnosis: string;
  setDiagnosis: (text: string) => void;
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

  const startListening = (field: "symptoms" | "diagnosis") => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA'; // Default to Arabic, often works with mixed English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListeningTo(field);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (field === "symptoms") {
        setSymptoms(symptoms ? `${symptoms} ${transcript}` : transcript);
      } else {
        setDiagnosis(diagnosis ? `${diagnosis} ${transcript}` : transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone access in your browser settings to use the Dictate feature.");
      } else if (event.error === 'network') {
        alert("Network error: Voice dictation requires an active internet connection to connect to the speech recognition servers. Please check your connection (or VPN) and try again.");
      } else {
        alert(`Microphone error: ${event.error}. Please try again.`);
      }
      setListeningTo(null);
    };

    recognition.onend = () => setListeningTo(null);

    recognition.start();
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuClipboardList className="text-primary text-xl" /> Clinical Assessment
        </h2>
        <button 
          onClick={() => setIsAssessmentMode(false)} 
          className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] flex items-center gap-1 no-print border border-[hsl(var(--color-border))] px-3 py-1.5 rounded-lg bg-[hsl(var(--color-bg-soft))] transition-colors"
        >
          <LuX /> Cancel Assessment
        </button>
      </div>
      
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Chief Complaints / Symptoms</label>
            <button 
              onClick={() => startListening("symptoms")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                listeningTo === "symptoms" 
                  ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" 
                  : "bg-[hsl(var(--color-bg-soft))] text-primary border border-[hsl(var(--color-border))] hover:bg-primary/10"
              }`}
            >
              <LuMic className={listeningTo === "symptoms" ? "animate-bounce" : ""} />
              {listeningTo === "symptoms" ? "Listening..." : "Dictate"}
            </button>
          </div>
          <textarea 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Patient reports..."
            className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Primary Diagnosis</label>
            <button 
              onClick={() => startListening("diagnosis")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                listeningTo === "diagnosis" 
                  ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" 
                  : "bg-[hsl(var(--color-bg-soft))] text-primary border border-[hsl(var(--color-border))] hover:bg-primary/10"
              }`}
            >
              <LuMic className={listeningTo === "diagnosis" ? "animate-bounce" : ""} />
              {listeningTo === "diagnosis" ? "Listening..." : "Dictate"}
            </button>
          </div>
          <textarea 
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Bronchitis, detailed observations..."
            className="w-full h-24 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
          />
        </div>
      </div>
    </div>
  );
}
