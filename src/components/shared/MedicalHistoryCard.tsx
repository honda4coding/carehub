import { LuClock, LuFileText, LuImage, LuPill, LuActivity } from "react-icons/lu";

interface MedicalHistoryCardProps {
  record: any;
  hideHeader?: boolean;
}

export default function MedicalHistoryCard({ record, hideHeader = false }: MedicalHistoryCardProps) {
  const hasVitals = record.bloodPressure || record.sugarLevel || record.pulse || record.temperature || (record.height && record.height !== "-") || (record.weight && record.weight !== "-");
  
  return (
    <div className={`w-full ${hideHeader ? '' : 'bg-[hsl(var(--color-bg-soft))] p-5 rounded-2xl border border-[hsl(var(--color-border))] hover:border-primary/30 transition-colors shadow-sm'}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-wrap justify-between items-start mb-4 gap-2 border-b border-[hsl(var(--color-border-soft))] pb-3">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[hsl(var(--color-text-muted))] flex items-center gap-1">
              <LuClock /> {new Date(record.createdAt).toLocaleDateString()}
            </span>
            <h4 className="text-sm font-black text-[hsl(var(--color-text))] mt-1">
              Diagnosis: <span className="text-primary">{record.diagnosis || "Not Recorded"}</span>
            </h4>
          </div>
          <span className="text-[10px] font-bold bg-[hsl(var(--color-primary)/0.1)] text-primary px-2 py-1 rounded-md whitespace-nowrap">
            Dr. {record.doctorId?.fullName || 'Unknown'}
          </span>
        </div>
      )}
      
      {/* Symptoms / Notes */}
      <div className="mb-4 bg-[hsl(var(--color-bg-base))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
        <span className="text-[10px] font-bold uppercase text-[hsl(var(--color-text-muted))] block mb-1">Symptoms / Notes:</span>
        <p className="text-xs font-medium text-[hsl(var(--color-text))]">
          {record.notes || <span className="text-[hsl(var(--color-text-muted))] italic">No symptoms recorded</span>}
        </p>
      </div>

      {/* Vitals Grid */}
      <div className="mb-4 bg-[hsl(var(--color-bg-base))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
        <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider flex items-center gap-1">
          <LuActivity /> Vitals Recorded:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
          <div><span className="text-[hsl(var(--color-text-muted))]">BP:</span> <span className="font-bold text-[hsl(var(--color-text))]">{record.bloodPressure || "--"}</span></div>
          <div><span className="text-[hsl(var(--color-text-muted))]">Sugar:</span> <span className="font-bold text-[hsl(var(--color-text))]">{record.sugarLevel || "--"}</span></div>
          <div><span className="text-[hsl(var(--color-text-muted))]">Pulse:</span> <span className="font-bold text-[hsl(var(--color-text))]">{record.pulse || "--"}</span></div>
          <div><span className="text-[hsl(var(--color-text-muted))]">Temp:</span> <span className="font-bold text-[hsl(var(--color-text))]">{record.temperature || "--"}</span></div>
          <div><span className="text-[hsl(var(--color-text-muted))]">Height:</span> <span className="font-bold text-[hsl(var(--color-text))]">{record.height !== "-" ? record.height : "--"}</span></div>
          <div><span className="text-[hsl(var(--color-text-muted))]">Weight:</span> <span className="font-bold text-[hsl(var(--color-text))]">{record.weight !== "-" ? record.weight : "--"}</span></div>
        </div>
      </div>

      {/* Alerts & Surgeries */}
      <div className="mb-4 bg-[hsl(var(--color-bg-base))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))] grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-[10px] text-[hsl(var(--color-danger)/0.8)] font-bold uppercase block mb-1">Allergies:</span>
          <span className="text-[11px] font-medium text-[hsl(var(--color-text))]">
            {record.allergies && record.allergies.length > 0 ? record.allergies.join(", ") : <span className="text-[hsl(var(--color-text-muted))] italic">None</span>}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[hsl(var(--color-warning)/0.8)] font-bold uppercase block mb-1">Chronic:</span>
          <span className="text-[11px] font-medium text-[hsl(var(--color-text))]">
            {record.chronic && record.chronic.length > 0 ? record.chronic.join(", ") : <span className="text-[hsl(var(--color-text-muted))] italic">None</span>}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-primary/80 font-bold uppercase block mb-1">Surgeries:</span>
          <span className="text-[11px] font-medium text-[hsl(var(--color-text))]">
            {record.surgeries && record.surgeries.length > 0 ? record.surgeries.map((s:any)=>s.operationName).join(", ") : <span className="text-[hsl(var(--color-text-muted))] italic">None</span>}
          </span>
        </div>
      </div>

      {/* Prescriptions */}
      <div className="mb-4 border-t border-[hsl(var(--color-border-soft))] pt-3">
        <h5 className="text-[11px] font-bold text-[hsl(var(--color-text))] flex items-center gap-1 mb-2">
          <LuPill className="text-[hsl(var(--color-secondary-strong))]" /> Medications Prescribed
        </h5>
        {record.prescriptions && record.prescriptions.length > 0 ? (
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
        ) : (
          <p className="text-[11px] text-[hsl(var(--color-text-muted))] italic bg-[hsl(var(--color-bg-base))] p-2 rounded-lg border border-[hsl(var(--color-border-soft))]">No medications prescribed in this visit.</p>
        )}
      </div>

      {/* Rx Notes */}
      <div className="mb-3 bg-[hsl(var(--color-bg-base))] p-3 rounded-xl border border-[hsl(var(--color-border-soft))]">
        <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">Rx Notes / Instructions:</p>
        <p className="text-[11px] text-[hsl(var(--color-text))]">
          {record.prescriptionText || <span className="text-[hsl(var(--color-text-muted))] italic">No notes</span>}
        </p>
      </div>
      
      {/* Documents */}
      <div className="mt-3">
        <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-wider">Attached Documents:</p>
        {record.documents && record.documents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {record.documents.map((doc: any, dIdx: number) => {
              let icon = <LuFileText />;
              let label = doc.title || "Document";
              if (doc.type === "prescription") { icon = <LuImage />; label = doc.title || "Scanned Rx"; }
              else if (doc.type === "lab") { icon = <LuFileText />; }
              else if (doc.type === "xray" || doc.type === "mri" || doc.type === "ct") { icon = <LuImage />; }
              
              return (
                <a key={dIdx} href={doc.secure_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:bg-[hsl(var(--color-primary)/0.1)] transition-colors bg-[hsl(var(--color-primary)/0.05)] px-3 py-1.5 rounded-lg border border-[hsl(var(--color-primary)/0.15)] shadow-sm">
                  {icon} {label}
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-[hsl(var(--color-text-muted))] italic">No documents attached.</p>
        )}
      </div>
    </div>
  );
}
