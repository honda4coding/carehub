import { LuPill, LuPlus, LuTrash2, LuImage, LuUpload, LuFileText, LuCamera, LuShieldAlert, LuLoader } from "react-icons/lu";
import Image from "next/image";
import { RefObject, useRef, useState, useEffect } from "react";
import WebcamCapture from "./WebcamCapture";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import ReactMarkdown from "react-markdown";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";

interface RxBuilderProps {
  prescriptions: any[];
  setPrescriptions: (prescriptions: any[]) => void;
  drugName: string;
  setDrugName: (val: string) => void;
  dosage: string;
  setDosage: (val: string) => void;
  frequency: string;
  setFrequency: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  instructions: string;
  setInstructions: (val: string) => void;
  handleAddDrug: () => void;
  removeDrug: (id: string) => void;
  prescriptionText: string;
  setPrescriptionText: (val: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string | null;
  removeFile: () => void;
  
  attachments?: File[];
  setAttachments?: (files: File[]) => void;
  attachmentsMetadata?: { type: string; title: string }[];
  setAttachmentsMetadata?: (meta: { type: string; title: string }[]) => void;
  attachmentsInputRef?: RefObject<HTMLInputElement | null>;
  patientComplaint?: string;
}

// Handles writing the prescription, managing drugs, and uploading a paper Rx image
export default function RxBuilder({
  prescriptions,
  drugName, setDrugName,
  dosage, setDosage,
  frequency, setFrequency,
  duration, setDuration,
  instructions, setInstructions,
  handleAddDrug,
  removeDrug,
  prescriptionText, setPrescriptionText,
  fileInputRef,
  handleFileChange,
  previewUrl,
  removeFile,
  attachments = [],
  setAttachments,
  attachmentsMetadata = [],
  setAttachmentsMetadata,
  attachmentsInputRef,
  patientComplaint
}: RxBuilderProps) {
    const t = useTranslations("auto");
  
  const handleAddAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (setAttachments && setAttachmentsMetadata) {
        setAttachments([...attachments, ...newFiles]);
        setAttachmentsMetadata([
          ...attachmentsMetadata,
          ...newFiles.map(f => ({ type: "lab", title: f.name }))
        ]);
      }
    }
  };

  const updateAttachmentMeta = (index: number, key: 'type' | 'title', value: string) => {
    if (setAttachmentsMetadata) {
      const newMeta = [...attachmentsMetadata];
      newMeta[index] = { ...newMeta[index], [key]: value };
      setAttachmentsMetadata(newMeta);
    }
  };

  const removeAttachment = (index: number) => {
    if (setAttachments && setAttachmentsMetadata) {
      const newFiles = [...attachments];
      newFiles.splice(index, 1);
      setAttachments(newFiles);

      const newMeta = [...attachmentsMetadata];
      newMeta.splice(index, 1);
      setAttachmentsMetadata(newMeta);
    }
  };

  const [cameraTarget, setCameraTarget] = useState<"prescription" | "attachments" | null>(null);

  const handleWebcamCapture = (file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const mockEvent = { target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
    
    if (cameraTarget === "prescription") {
      handleFileChange(mockEvent);
    } else if (cameraTarget === "attachments") {
      handleAddAttachments(mockEvent);
    }
    setCameraTarget(null);
  };

  const [checkingInteraction, setCheckingInteraction] = useState(false);
  const [interactionResult, setInteractionResult] = useState<{analysis: string, severity: string} | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDrugs, setFilteredDrugs] = useState<string[]>([]);
  const [isSearchingDrugs, setIsSearchingDrugs] = useState(false);
  const drugInputRef = useRef<HTMLDivElement>(null);
  const debouncedDrugSearch = useDebounce(drugName, 400);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugInputRef.current && !drugInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API Search for drugs when debounced value changes
  useEffect(() => {
    const searchDrugsAPI = async () => {
      if (!debouncedDrugSearch || debouncedDrugSearch.length < 2) {
        setFilteredDrugs([]);
        setShowSuggestions(false);
        return;
      }
      
      setIsSearchingDrugs(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const token = Cookies.get(AUTH_COOKIE_NAME);
        
        const res = await axios.get(`${baseUrl}/drugs/search?q=${debouncedDrugSearch}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const results = res.data?.data?.drugs?.map((d: any) => d.name) || [];
        setFilteredDrugs(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("Failed to search drugs", err);
      } finally {
        setIsSearchingDrugs(false);
      }
    };
    
    // Only search if we haven't just selected a drug from the list
    if (showSuggestions || debouncedDrugSearch) {
        searchDrugsAPI();
    }
  }, [debouncedDrugSearch]);

  const [durNum, setDurNum] = useState("");
  const [durUnit, setDurUnit] = useState("Days");
  
  useEffect(() => {
    if (duration.toLowerCase() === "lifelong") {
      // Handled by checkbox
    } else if (duration) {
      const parts = duration.split(" ");
      if (parts.length >= 2) {
        setDurNum(parts[0]);
        setDurUnit(parts.slice(1).join(" "));
      } else {
        setDurNum(duration);
      }
    } else {
      setDurNum("");
      setDurUnit("Days");
    }
  }, [duration]);

  const updateDuration = (num: string, unit: string) => {
    setDurNum(num);
    setDurUnit(unit);
    if (num) {
      setDuration(`${num} ${unit}`);
    } else {
      setDuration("");
    }
  };

  const handleDrugNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrugName(e.target.value);
    if (!showSuggestions) setShowSuggestions(true);
  };

  const selectDrug = (drug: string) => {
    setDrugName(drug);
    setShowSuggestions(false);
  };

  const handleCheckInteractions = async () => {
    setCheckingInteraction(true);
   setInteractionResult(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const token = Cookies.get(AUTH_COOKIE_NAME);
      
      const currentDrugs = prescriptions.map(p => p.medicineName);
      let newDrugs = [];
      if (drugName) newDrugs.push(drugName);

      if (currentDrugs.length === 0 && newDrugs.length === 0) {
        alert("Please add some drugs to check interactions.");
        setCheckingInteraction(false);
        return;
      }

      const response = await axios.post(
        `${baseUrl}/ai/interactions`,
        { currentDrugs, newDrugs, newComplaint: patientComplaint },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setInteractionResult({
        analysis: response.data?.data?.analysis || "No interactions found.",
        severity: response.data?.data?.severity || "SAFE"
      });
    } catch (error) {
      console.error(error);
      setInteractionResult({
        analysis: "Failed to check interactions. Please try again.",
        severity: "WARNING"
      });
    } finally {
      setCheckingInteraction(false);
    }
  };

  return (
    <>
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuPill className="text-primary text-xl" /> {t('prescriptionRx')}</h2>
          <button 
            onClick={handleCheckInteractions}
            disabled={checkingInteraction}
            className="text-sm font-bold bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-primary))] hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {checkingInteraction ? <LuLoader className="animate-spin" /> : <LuShieldAlert />}
            {t('aiSafetyCheck')}</button>
        </div>

        {interactionResult && (() => {
          const isDanger = interactionResult.severity === "DANGER";
          const isWarning = interactionResult.severity === "WARNING";
          
          let boxColors = "bg-blue-50/80 border-s-4 border-s-blue-500 border-y border-e border-transparent text-main ";
          let iconColor = "text-primary";
          let btnColor = "text-primary hover:text-blue-900";
          
          if (isDanger) {
            boxColors = "bg-danger-light/80 border-s-4 border-s-red-500 border-y border-e border-transparent text-main ";
            iconColor = "text-danger";
            btnColor = "text-red-700 hover:text-red-900";
          } else if (isWarning) {
            boxColors = "bg-amber-50/80 border-s-4 border-s-amber-500 border-y border-e border-transparent text-main ";
            iconColor = "text-amber-500";
            btnColor = "text-amber-700 hover:text-amber-900";
          }

          return (
            <div className={`mb-5 p-5 rounded-lg flex gap-4 text-[15px] ${boxColors}`}>
              <LuShieldAlert className={`text-2xl shrink-0 mt-0.5 ${iconColor}`} />
              <div className="font-semibold whitespace-pre-wrap leading-relaxed w-full [&>p]:my-1 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>strong]:font-black [&>strong]:text-main">
                <ReactMarkdown>{interactionResult.analysis}</ReactMarkdown>
                <button onClick={() => setInteractionResult(null)} className={`block mt-3 text-xs font-bold underline cursor-pointer ${btnColor}`}>{t('dismiss')}</button>
              </div>
            </div>
          );
        })()}
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 p-4 bg-[hsl(var(--color-bg-soft))] rounded-xl border border-[hsl(var(--color-border-soft))] no-print">
          <div className="md:col-span-2 relative" ref={drugInputRef}>
            <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('drugName')}</label>
            <input 
              value={drugName} 
              onChange={handleDrugNameChange} 
              onFocus={() => { if(filteredDrugs.length > 0 && drugName) setShowSuggestions(true); }}
              type="text" 
              placeholder={t('egAmoxicillin')} 
              className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" 
              autoComplete="off"
            />
            {showSuggestions && (
              <ul className="absolute z-50 w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] mt-1 rounded-lg max-h-48 overflow-y-auto">
                {isSearchingDrugs && filteredDrugs.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-[hsl(var(--color-text-muted))] flex items-center justify-center gap-2">
                    <LuLoader className="animate-spin" /> {t('searching')}</li>
                ) : filteredDrugs.map((drug) => (
                  <li 
                    key={drug} 
                    onClick={() => selectDrug(drug)}
                    className="px-3 py-2 text-sm hover:bg-[hsl(var(--color-bg-soft))] cursor-pointer transition-colors text-[hsl(var(--color-text))]"
                  >
                    {drug}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('dosage')}</label>
            <input value={dosage} onChange={e=>setDosage(e.target.value)} type="text" placeholder={t('500mg')} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('frequency')}</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
            >
              <option value="">{t('selectFrequency')}</option>
              <option value="1 time daily">{t('1TimeDaily')}</option>
              <option value="2 times daily">{t('2TimesDaily')}</option>
              <option value="3 times daily">{t('3TimesDaily')}</option>
              <option value="4 times daily">{t('4TimesDaily')}</option>
              <option value="Every 8 hours">{t('every8Hours')}</option>
              <option value="Every 12 hours">{t('every12Hours')}</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))]">{t('duration')}</label>
              <label className="flex items-center gap-1 cursor-pointer text-[11px] font-bold text-[hsl(var(--color-primary))] uppercase">
                <input type="checkbox" checked={duration.toLowerCase() === "lifelong"} onChange={(e) => setDuration(e.target.checked ? "Lifelong" : "")} className="accent-primary w-3 h-3" />
                {t('lifelong')}</label>
            </div>
            <div className="flex gap-2">
              <input disabled={duration.toLowerCase() === "lifelong"} value={durNum} onChange={e=>updateDuration(e.target.value, durUnit)} type="number" min="1" placeholder={t('eg5')} className="w-1/2 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors disabled:opacity-50" />
              <select disabled={duration.toLowerCase() === "lifelong"} value={durUnit} onChange={e=>updateDuration(durNum, e.target.value)} className="w-1/2 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors disabled:opacity-50">
                <option value="Days">{t('days')}</option>
                <option value="Weeks">{t('weeks')}</option>
                <option value="Months">{t('months')}</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-5 mt-2">
            <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('instructionsOptional')}</label>
            <input value={instructions} onChange={e=>setInstructions(e.target.value)} type="text" placeholder={t('egAfterMeals')} className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div className="flex items-end mt-2 md:col-span-1">
            <button onClick={handleAddDrug} className="w-full bg-[hsl(var(--color-secondary))] text-white hover:bg-[hsl(var(--color-secondary-strong))] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer">
              <LuPlus /> {t('add')}</button>
          </div>
        </div>

        {prescriptions.length > 0 ? (
          <div className="space-y-3 print-area">
            <h3 className="text-sm font-bold text-[hsl(var(--color-text))] mb-2 hidden print:block">{t('prescribedMedications')}</h3>
            {prescriptions.map((drug) => (
              <div key={drug.id} className="flex items-center justify-between p-3 border border-[hsl(var(--color-border))] rounded-xl hover:border-primary/50 transition-colors group bg-[hsl(var(--color-bg-soft))]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-primary))]">
                    <LuPill />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[hsl(var(--color-text))]">{drug.medicineName} <span className="text-xs font-semibold text-[hsl(var(--color-text-muted))] ms-2">{drug.dosage}</span></h4>
                    <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mt-0.5">{drug.frequency} {t('for')}{drug.duration}</p>
                    {drug.instructions && <p className="text-[11px] text-[hsl(var(--color-primary))] mt-0.5 font-semibold">{drug.instructions}</p>}
                  </div>
                </div>
                <button onClick={() => removeDrug(drug.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[hsl(var(--color-danger)/0.5)] hover:bg-[hsl(var(--color-danger)/0.1)] hover:text-[hsl(var(--color-danger))] transition-colors no-print cursor-pointer">
                  <LuTrash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl no-print">
            <LuPill className="text-3xl text-[hsl(var(--color-border-soft))] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">{t('noMedicationsPrescribedYet')}</p>
          </div>
        )}
      </div>

      {/* Upload Rx Section */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 no-print">
        <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2 mb-5">
          <LuImage className="text-primary text-xl" /> {t('alternativelyUploadPaperPrescription')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-[hsl(var(--color-text-muted))] mb-4">
              {t('ifYouPreferTo')}</p>
            
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <div className="flex gap-3 h-40">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-[hsl(var(--color-border))] hover:border-primary hover:bg-[hsl(var(--color-primary)/0.02)] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-[hsl(var(--color-text-muted))] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-bg-soft))] flex items-center justify-center">
                    <LuUpload className="text-xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[hsl(var(--color-text))]">{t('uploadFile')}</p>
                    <p className="text-[11px] mt-1">{t('jpegPng')}</p>
                  </div>
                </button>

                <button 
                  onClick={() => setCameraTarget("prescription")}
                  className="flex-1 border-2 border-dashed border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-bg-soft))] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-[hsl(var(--color-text-muted))] cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] flex items-center justify-center">
                    <LuCamera className="text-xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[hsl(var(--color-primary))]">{t('takePhoto')}</p>
                    <p className="text-[10px] mt-1 text-[hsl(var(--color-primary))/0.7]">{t('useCamera')}</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-[hsl(var(--color-border))]">
                <Image src={previewUrl} alt={t('prescriptionPreview')} width={400} height={160} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={removeFile} className="bg-danger text-white p-2 rounded-full hover:scale-110 transition-transform cursor-pointer">
                    <LuTrash2 />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">{t('prescriptionNotesOptional')}</label>
            <textarea 
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder={t('anyAdditionalInstructionsRegarding')}
              className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* Upload Medical Documents Section */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 no-print mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuFileText className="text-primary text-xl shrink-0" /> <span className="truncate">{t('medicalAttachmentsLabsScans')}</span>
          </h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button 
              onClick={() => attachmentsInputRef?.current?.click()}
              className="flex-1 sm:flex-none justify-center text-sm font-bold bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <LuUpload className="shrink-0" /> {t('upload')}</button>
            <button 
              onClick={() => setCameraTarget("attachments")}
              className="flex-1 sm:flex-none justify-center text-sm font-bold bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <LuCamera className="shrink-0" /> {t('camera')}</button>
          </div>
        </div>
        
        <input 
          type="file" 
          multiple
          accept="image/*,application/pdf"
          ref={attachmentsInputRef}
          onChange={handleAddAttachments}
          className="hidden"
        />

        {attachments.length > 0 ? (
          <div className="space-y-3">
            {attachments.map((file, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-3 p-3 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] flex items-center justify-center text-[hsl(var(--color-primary))] shrink-0">
                  <LuFileText />
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('documentTitle')}</label>
                    <input 
                      type="text" 
                      value={attachmentsMetadata[index]?.title || ''} 
                      onChange={(e) => updateAttachmentMeta(index, 'title', e.target.value)}
                      placeholder={t('egCbcResults')}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div className={attachmentsMetadata[index]?.type === 'other' ? "md:col-span-3" : "md:col-span-7"}>
                    <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('type')}</label>
                    <select
                      value={attachmentsMetadata[index]?.type || 'lab'}
                      onChange={(e) => updateAttachmentMeta(index, 'type', e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none transition-colors"
                    >
                      <option value="lab">{t('labTest')}</option>
                      <option value="xray">{t('xray')}</option>
                      <option value="mri">{t('mriScan')}</option>
                      <option value="ct">{t('ctScan')}</option>
                      <option value="other">{t('specifyOther')}</option>
                    </select>
                  </div>
                  {attachmentsMetadata[index]?.type === 'other' && (
                     <div className="md:col-span-4">
                      <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">{t('specifyType')}</label>
                      <input 
                        type="text" 
                        placeholder={t('egEcg')}
                        onChange={(e) => {
                          const currentTitle = attachmentsMetadata[index]?.title || '';
                          const cleanTitle = currentTitle.includes("]") ? currentTitle.split("] ")[1] || currentTitle : currentTitle;
                          updateAttachmentMeta(index, 'title', e.target.value ? `[${e.target.value}] ${cleanTitle}` : cleanTitle);
                        }}
                        className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeAttachment(index)} 
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-[hsl(var(--color-danger)/0.5)] hover:bg-[hsl(var(--color-danger)/0.1)] hover:text-[hsl(var(--color-danger))] transition-colors cursor-pointer"
                >
                  <LuTrash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl">
            <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">{t('noLabTestsOr')}</p>
          </div>
        )}
      </div>

      {cameraTarget && (
        <WebcamCapture 
          onCapture={handleWebcamCapture} 
          onClose={() => setCameraTarget(null)} 
          title={cameraTarget === "prescription" ? "Capture Prescription" : "Capture Medical Document"}
        />
      )}
    </>
  );
}
