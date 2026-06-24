"use client";

import { useParams, useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

import ClinicDetailsPanel from "@/components/clinics/ClinicDetailsPanel";

export default function ClinicDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicId = params?.clinicId as string;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4">
        <button
          onClick={() => router.push("/doctor/clinics")}
          className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] flex items-center gap-1 pl-11 md:pl-0 cursor-pointer"
        >
          <LuArrowLeft /> Back to clinics
        </button>
      </header>

      <div className="p-4 md:p-6 flex-1">
        <ClinicDetailsPanel clinicId={clinicId} />
      </div>
    </div>
  );
}
