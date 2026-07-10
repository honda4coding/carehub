"use client";
import { LuShieldAlert, LuActivity } from "react-icons/lu";
import { Card } from "@/components/ui/Card";

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
        <Card className="p-4 border-[hsl(var(--color-danger-bg))] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px">
          <div className="flex items-center gap-2 mb-3">
            <LuShieldAlert className="text-[hsl(var(--color-danger))]" />
            <h3 className="text-sm font-bold uppercase text-[hsl(var(--color-danger))] tracking-widest">Allergies</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a, idx) => (
              <span key={idx} className="bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] px-3 py-1.5 rounded-lg text-xs font-bold">
                ⚠️ {a}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Chronic Diseases */}
      {chronicDiseases.length > 0 && (
        <Card className="p-4 border-[hsl(var(--color-warning-bg))] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px">
          <div className="flex items-center gap-2 mb-3">
            <LuActivity className="text-[hsl(var(--color-warning))]" />
            <h3 className="text-sm font-bold uppercase text-[hsl(var(--color-warning))] tracking-widest">Chronic Conditions</h3>
          </div>
          <div className="flex flex-col gap-2">
            {chronicDiseases.map((c, idx) => (
              <span key={idx} className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--color-text))] bg-[hsl(var(--color-warning-bg))] px-3 py-1.5 rounded-lg w-fit">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--color-warning))] shrink-0" />
                {c}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
