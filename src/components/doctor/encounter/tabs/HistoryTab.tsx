"use client";

import MedicationCompliancePanel from "@/components/doctor/encounter/MedicationCompliancePanel";
import HistoryTimeline from "@/components/doctor/encounter/HistoryTimeline";

export interface HistoryTabProps {
  sessionData: any;
  startDate: string; setStartDate: (val: string) => void;
  endDate: string; setEndDate: (val: string) => void;
  filterText: string; setFilterText: (val: string) => void;
  loadingHistory: boolean;
  page: number;
  fullMedicalHistory: any[];
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  setIsAssessmentMode: () => void;
}

export default function HistoryTab({
  sessionData,
  startDate, setStartDate,
  endDate, setEndDate,
  filterText, setFilterText,
  loadingHistory,
  page,
  fullMedicalHistory,
  hasMore,
  observerTarget,
  setIsAssessmentMode
}: HistoryTabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-3">
        {sessionData && !sessionData.isOfflinePatient && sessionData.patientId ? (
          <MedicationCompliancePanel patientId={sessionData.patientId._id} />
        ) : (
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-3xl p-6 border border-[hsl(var(--color-border))] text-center">
            <p className="text-sm text-[hsl(var(--color-text-muted))]">Compliance tracking is not available for offline patients.</p>
          </div>
        )}
      </div>
      <div className="xl:col-span-9 flex flex-col min-w-0">
        <HistoryTimeline 
          setIsAssessmentMode={setIsAssessmentMode}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          filterText={filterText}
          setFilterText={setFilterText}
          loadingHistory={loadingHistory}
          page={page}
          fullMedicalHistory={fullMedicalHistory}
          hasMore={hasMore}
          observerTarget={observerTarget}
        />
      </div>
    </div>
  );
}
