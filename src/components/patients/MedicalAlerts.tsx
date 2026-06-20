"use client";
import { LuShieldAlert, LuActivity } from "react-icons/lu";

interface Props {
  allergies: string[];
  chronicDiseases: string[];
}

export default function MedicalAlerts({ allergies, chronicDiseases }: Props) {
  if (allergies.length === 0 && chronicDiseases.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Allergies */}
      {allergies.length > 0 && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-danger-bg))] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <LuShieldAlert className="text-[hsl(var(--color-danger))]" />
            <h3 className="text-[12px] font-black uppercase text-[hsl(var(--color-danger))] tracking-wider">Allergies</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a, idx) => (
              <span key={idx} className="bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] px-2.5 py-1 rounded-lg text-[11px] font-bold">
                ⚠️ {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chronic Diseases */}
      {chronicDiseases.length > 0 && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-warning-bg))] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <LuActivity className="text-[hsl(var(--color-warning))]" />
            <h3 className="text-[12px] font-black uppercase text-[hsl(var(--color-warning))] tracking-wider">Chronic Conditions</h3>
          </div>
          <div className="flex flex-col gap-2">
            {chronicDiseases.map((c, idx) => (
              <span key={idx} className="flex items-center gap-2 text-[11px] font-bold text-[hsl(var(--color-text))] bg-[hsl(var(--color-warning-bg))] px-3 py-1.5 rounded-lg w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-warning))] shrink-0" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
