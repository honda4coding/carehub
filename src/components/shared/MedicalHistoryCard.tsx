import {
  LuFileText, LuImage, LuPill, LuActivity, LuHeartPulse,
  LuThermometer, LuDroplets, LuWeight, LuRuler, LuShieldAlert,
  LuScissors, LuExternalLink,
} from "react-icons/lu";
import { useTranslations } from "next-intl";

interface MedicalHistoryCardProps {
  record: any;
  hideHeader?: boolean;
}

function VitalItem({
  icon, label, value, unit, highlight = false,
}: {
  icon: React.ReactNode; label: string; value: string | undefined; unit: string; highlight?: boolean;
}) {
    const t = useTranslations("auto");
  if (!value || value === "--" || value === "-") return null;
  return (
    <div className={`rounded-xl p-3 border ${
      highlight
        ? "bg-[hsl(var(--color-danger-bg))] border-[hsl(var(--color-danger)/0.15)]"
        : "bg-[hsl(var(--color-bg-surface-hover))] border-[hsl(var(--color-border))]"
    }`}>
      <div className={`flex items-center gap-1.5 text-[11px] font-medium mb-1.5 ${
        highlight ? "text-[hsl(var(--color-danger))]" : "text-[hsl(var(--color-text-muted))]"
      }`}>
        {icon} {label}
      </div>
      <div className={`text-[18px] font-semibold leading-none ${
        highlight ? "text-[hsl(var(--color-danger))]" : "text-[hsl(var(--color-text))]"
      }`}>
        {value}
        <span className="text-[12px] font-normal text-[hsl(var(--color-text-muted))] ms-1">{unit}</span>
      </div>
    </div>
  );
}

export default function MedicalHistoryCard({ record, hideHeader = false }: MedicalHistoryCardProps) {
    const t = useTranslations("auto");
  const hasVitals =
    record.bloodPressure || record.sugarLevel || record.pulse ||
    record.temperature || (record.height && record.height !== "-") ||
    (record.weight && record.weight !== "-");

  const prescriptions = record.prescriptions || [];
  const documents = record.documents || [];
  const allergies: string[] = record.allergies || [];
  const chronic: string[] = record.chronic || [];
  const surgeries: any[] = record.surgeries || [];

  const tempVal = parseFloat(record.temperature);
  const highTemp = !isNaN(tempVal) && tempVal >= 38;

  const hasMeds = prescriptions.some((rx: any) => rx.medications?.length > 0);

  return (
    <div className={`w-full space-y-4 ${hideHeader ? "" : "bg-[hsl(var(--color-bg-surface))] p-5 rounded-2xl border border-[hsl(var(--color-border))]"}`}>

      {/* ── Header (when not hidden) ── */}
      {!hideHeader && (
        <div className="pb-3 border-b border-[hsl(var(--color-border))]">
          <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] mb-1">
            {new Date(record.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
          <h4 className="text-[16px] font-semibold text-[hsl(var(--color-text))]">
            {record.diagnosis || "No diagnosis recorded"}
          </h4>
          {record.doctorId && (
            <p className="text-[13px] text-[hsl(var(--color-text-muted))] mt-0.5 font-medium">
              {t('dr')}{record.doctorId.fullName || record.doctorId.userName}
              {record.doctorId.specialization && ` · ${record.doctorId.specialization}`}
            </p>
          )}
        </div>
      )}

      {/* ── Vitals ── */}
      {hasVitals && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5 flex items-center gap-1.5">
            <LuActivity className="text-[hsl(var(--color-primary))]" /> {t('vitals')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <VitalItem icon={<LuHeartPulse />} label={t('bloodPressure')} value={record.bloodPressure} unit="mmHg" />
            <VitalItem icon={<LuDroplets />} label={t('sugarLevel')} value={record.sugarLevel} unit="mg/dL" />
            <VitalItem icon={<LuActivity />} label={t('pulse')} value={record.pulse} unit="bpm" />
            <VitalItem icon={<LuThermometer />} label={t('temperature')} value={record.temperature} unit="°C" highlight={highTemp} />
            <VitalItem icon={<LuRuler />} label={t('height')} value={record.height !== "-" ? record.height : undefined} unit="cm" />
            <VitalItem icon={<LuWeight />} label={t('weight')} value={record.weight !== "-" ? record.weight : undefined} unit="kg" />
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {record.notes && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">
            {t('symptomsAmpNotes')}</p>
          <div className="p-3.5 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
            <p className="text-[13px] text-[hsl(var(--color-text))] leading-relaxed">{record.notes}</p>
          </div>
        </div>
      )}

      {/* ── Alerts row: Allergies + Chronic + Surgeries ── */}
      {(allergies.length > 0 || chronic.length > 0 || surgeries.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {allergies.length > 0 && (
            <div className="p-3 rounded-xl bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger)/0.15)]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--color-danger)/0.8)] mb-1.5 flex items-center gap-1">
                <LuShieldAlert /> {t('allergies')}</p>
              <p className="text-[12px] font-medium text-[hsl(var(--color-text))]">{allergies.join(", ")}</p>
            </div>
          )}
          {chronic.length > 0 && (
            <div className="p-3 rounded-xl bg-[hsl(var(--color-warning-bg))] border border-[hsl(var(--color-warning)/0.15)]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--color-warning)/0.8)] mb-1.5 flex items-center gap-1">
                <LuActivity /> {t('chronic')}</p>
              <p className="text-[12px] font-medium text-[hsl(var(--color-text))]">{chronic.join(", ")}</p>
            </div>
          )}
          {surgeries.length > 0 && (
            <div className="p-3 rounded-xl bg-[hsl(var(--color-primary)/0.06)] border border-[hsl(var(--color-primary)/0.15)]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-strong)/0.8)] mb-1.5 flex items-center gap-1">
                <LuScissors /> {t('surgeries')}</p>
              <p className="text-[12px] font-medium text-[hsl(var(--color-text))]">
                {surgeries.map((s: any) => typeof s === "string" ? s : s.operationName || "").join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Medications ── */}
      {hasMeds && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5 flex items-center gap-1.5">
            <LuPill className="text-[hsl(var(--color-primary))]" /> {t('medicationsPrescribed')}</p>
          <div className="space-y-2">
            {prescriptions.map((rx: any) =>
              rx.medications?.map((med: any, mIdx: number) => (
                <div
                  key={mIdx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-[hsl(var(--color-primary))] shrink-0 mt-0.5">
                    <LuPill className="text-[13px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[hsl(var(--color-text))] leading-tight">{med.medicineName}</p>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5 font-medium">
                      {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {record.prescriptionText && (
            <div className="mt-2 p-3 rounded-xl bg-[hsl(var(--color-bg-surface-hover))] border border-[hsl(var(--color-border))]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1">{t('rxNotes')}</p>
              <p className="text-[13px] text-[hsl(var(--color-text))] leading-relaxed">{record.prescriptionText}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Documents ── */}
      {documents.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2.5 flex items-center gap-1.5">
            <LuFileText className="text-[hsl(var(--color-primary))]" /> {t('documents')}</p>
          <div className="flex flex-wrap gap-2">
            {documents.map((doc: any, dIdx: number) => {
              const isImage = ["prescription", "xray", "mri", "ct"].includes(doc.type);
              return (
                <a
                  key={dIdx}
                  href={doc.secure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold
                    bg-[hsl(var(--color-primary)/0.06)] text-[hsl(var(--color-primary-strong))]
                    border border-[hsl(var(--color-primary)/0.15)] hover:bg-[hsl(var(--color-primary)/0.12)] transition-colors"
                >
                  {isImage ? <LuImage className="text-[12px]" /> : <LuFileText className="text-[12px]" />}
                  {doc.title || "Document"}
                  <LuExternalLink className="text-[10px] opacity-60" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
