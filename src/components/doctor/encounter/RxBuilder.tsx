import { LuPill, LuPlus, LuTrash2, LuImage, LuUpload, LuFileText, LuCamera } from "react-icons/lu";
import Image from "next/image";
import { RefObject, useRef, useState } from "react";
import WebcamCapture from "./WebcamCapture";

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
  attachmentsInputRef
}: RxBuilderProps) {
  
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

  return (
    <>
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
              <div className="flex gap-3 h-40">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-[hsl(var(--color-border))] hover:border-primary hover:bg-[hsl(var(--color-primary)/0.02)] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-[hsl(var(--color-text-muted))]"
                >
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-bg-soft))] flex items-center justify-center">
                    <LuUpload className="text-xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[hsl(var(--color-text))]">Upload File</p>
                    <p className="text-[10px] mt-1">JPEG, PNG</p>
                  </div>
                </button>

                <button 
                  onClick={() => setCameraTarget("prescription")}
                  className="flex-1 border-2 border-dashed border-[hsl(var(--color-border))] hover:border-primary hover:bg-[hsl(var(--color-primary)/0.02)] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-[hsl(var(--color-text-muted))]"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <LuCamera className="text-xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-primary">Take Photo</p>
                    <p className="text-[10px] mt-1 text-primary/70">Use Camera</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-[hsl(var(--color-border))]">
                <Image src={previewUrl} alt="Prescription preview" width={400} height={160} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={removeFile} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg">
                    <LuTrash2 />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">Prescription Notes (Optional)</label>
            <textarea 
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="Any additional instructions regarding the prescription..."
              className="w-full h-32 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* Upload Medical Documents Section */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 shadow-sm no-print mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuFileText className="text-primary text-xl" /> Medical Attachments (Labs, Scans)
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => attachmentsInputRef?.current?.click()}
              className="text-xs font-bold bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <LuUpload /> Upload
            </button>
            <button 
              onClick={() => setCameraTarget("attachments")}
              className="text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <LuCamera /> Camera
            </button>
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
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-primary shrink-0">
                  <LuFileText />
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Document Title</label>
                    <input 
                      type="text" 
                      value={attachmentsMetadata[index]?.title || ''} 
                      onChange={(e) => updateAttachmentMeta(index, 'title', e.target.value)}
                      placeholder="e.g. CBC Results"
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div className={attachmentsMetadata[index]?.type === 'other' ? "md:col-span-3" : "md:col-span-7"}>
                    <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Type</label>
                    <select
                      value={attachmentsMetadata[index]?.type || 'lab'}
                      onChange={(e) => updateAttachmentMeta(index, 'type', e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg px-3 py-1.5 text-sm focus:border-primary outline-none transition-colors"
                    >
                      <option value="lab">Lab Test (تحليل)</option>
                      <option value="xray">X-Ray (أشعة عادية)</option>
                      <option value="mri">MRI Scan (رنين)</option>
                      <option value="ct">CT Scan (مقطعية)</option>
                      <option value="other">Specify Other...</option>
                    </select>
                  </div>
                  {attachmentsMetadata[index]?.type === 'other' && (
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] mb-1">Specify Type</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ECG"
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
                  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-[hsl(var(--color-danger)/0.5)] hover:bg-[hsl(var(--color-danger)/0.1)] hover:text-[hsl(var(--color-danger))] transition-colors"
                >
                  <LuTrash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-[hsl(var(--color-border))] rounded-xl">
            <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">No lab tests or scans attached to this encounter.</p>
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
