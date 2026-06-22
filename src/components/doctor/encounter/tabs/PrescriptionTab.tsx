"use client";

import RxBuilder from "@/components/doctor/encounter/RxBuilder";

export interface PrescriptionTabProps {
  prescriptions: any[]; setPrescriptions: (val: any[]) => void;
  drugName: string; setDrugName: (val: string) => void;
  dosage: string; setDosage: (val: string) => void;
  frequency: string; setFrequency: (val: string) => void;
  duration: string; setDuration: (val: string) => void;
  patientComplaint: string;
  instructions: string; setInstructions: (val: string) => void;
  handleAddDrug: () => void;
  removeDrug: (id: string) => void;
  prescriptionText: string; setPrescriptionText: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string | null;
  removeFile: () => void;
  attachments: File[];
  setAttachments: (val: File[]) => void;
  attachmentsMetadata: { type: string; title: string }[];
  setAttachmentsMetadata: (val: { type: string; title: string }[]) => void;
  attachmentsInputRef: React.RefObject<HTMLInputElement>;
}

export default function PrescriptionTab({
  prescriptions, setPrescriptions,
  drugName, setDrugName,
  dosage, setDosage,
  frequency, setFrequency,
  duration, setDuration,
  patientComplaint,
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
  attachmentsInputRef
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
    </div>
  );
}
