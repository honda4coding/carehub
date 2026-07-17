"use client";

import RxBuilder from "@/components/doctor/encounter/RxBuilder";
import { LuCalendarRange, LuCalendarClock } from "react-icons/lu";

export interface PrescriptionTabProps {
  prescriptions: any[]; setPrescriptions: (val: any[]) => void;
  drugName: string; setDrugName: (val: string) => void;
  dosage: string; setDosage: (val: string) => void;
  frequency: string; setFrequency: (val: string) => void;
  duration: string; setDuration: (val: string) => void;
  patientComplaint: string;
  patientId?: string;
  allergies?: string[];
  chronic?: string[];
  surgeries?: { operationName: string; [key: string]: any }[];
  instructions: string; setInstructions: (val: string) => void;
  handleAddDrug: () => void;
  removeDrug: (id: string) => void;
  prescriptionText: string; setPrescriptionText: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string | null;
  removeFile: () => void;
  attachments: File[];
  setAttachments: (val: File[]) => void;
  attachmentsMetadata: { type: string; title: string }[];
  setAttachmentsMetadata: (val: { type: string; title: string }[]) => void;
  attachmentsInputRef: React.RefObject<HTMLInputElement | null>;
  followUpDate?: string;
  setFollowUpDate?: (val: string) => void;
}

export default function PrescriptionTab({
  prescriptions, setPrescriptions,
  drugName, setDrugName,
  dosage, setDosage,
  frequency, setFrequency,
  duration, setDuration,
  patientComplaint,
  patientId,
  allergies,
  chronic,
  surgeries,
  instructions, setInstructions,
  handleAddDrug,
  removeDrug,
  prescriptionText, setPrescriptionText,
  fileInputRef,
  handleFileChange,
  previewUrl,
  removeFile,
  attachments,
  setAttachments,
  attachmentsMetadata,
  setAttachmentsMetadata,
  attachmentsInputRef,
  followUpDate,
  setFollowUpDate
}: PrescriptionTabProps) {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <RxBuilder 
        prescriptions={prescriptions}
        setPrescriptions={setPrescriptions}
        drugName={drugName} setDrugName={setDrugName}
        dosage={dosage} setDosage={setDosage}
        frequency={frequency} setFrequency={setFrequency}
        duration={duration} setDuration={setDuration}
        patientComplaint={patientComplaint}
        patientId={patientId}
        allergies={allergies}
        chronic={chronic}
        surgeries={surgeries}
        instructions={instructions} setInstructions={setInstructions}
        handleAddDrug={handleAddDrug}
        removeDrug={removeDrug}
        prescriptionText={prescriptionText} setPrescriptionText={setPrescriptionText}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        previewUrl={previewUrl}
        removeFile={removeFile}
        attachments={attachments}
        setAttachments={setAttachments}
        attachmentsMetadata={attachmentsMetadata}
        setAttachmentsMetadata={setAttachmentsMetadata}
        attachmentsInputRef={attachmentsInputRef}
      />

      {/* Follow-up Section */}
      <div className="mt-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary-bg))] flex items-center justify-center text-[hsl(var(--color-primary))] shrink-0">
            <LuCalendarRange className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-black text-[hsl(var(--color-text))]">Schedule Follow-up</h3>
            <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))]">
              Recommend a follow-up consultation within a specific timeframe.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase text-[hsl(var(--color-text-muted))] mb-2">
              Follow-up Within (Days)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-text-muted))]">
                <LuCalendarClock />
              </span>
              <input
                type="number"
                min="1"
                placeholder="e.g. 7"
                value={followUpDate || ""}
                onChange={(e) => setFollowUpDate && setFollowUpDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--color-bg-base))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] rounded-xl text-sm font-semibold focus:border-[hsl(var(--color-primary))] focus:ring-1 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setFollowUpDate && setFollowUpDate(days.toString())}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  followUpDate === days.toString()
                    ? "bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]"
                    : "bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-text-muted))]"
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
