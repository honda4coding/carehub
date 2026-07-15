"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clinic, getMyClinics, updateClinic } from "@/services/clinicService";
import { subscriptionService, DoctorSubscription } from "@/services/subscriptionService";
import { LuTriangleAlert, LuBuilding2 } from "react-icons/lu";

export default function GlobalClinicLimitGuard() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeClinics, setActiveClinics] = useState<Clinic[]>([]);
  const [maxAllowedClinics, setMaxAllowedClinics] = useState(1);
  const [selectedClinicsToKeep, setSelectedClinicsToKeep] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (role !== "doctor") return;

    let isMounted = true;
    (async () => {
      try {
        const [clinicsData, subscription] = await Promise.all([
          getMyClinics(),
          subscriptionService.getMySubscription()
        ]);

        if (!isMounted) return;

        const allActive = (clinicsData.clinics || []).filter((c: Clinic) => c.isActive);
        setActiveClinics(allActive);

        let dbLimitValue: number | undefined;
        if (subscription?.subscriptionId?.limits) {
          const limitObj = subscription.subscriptionId.limits.find((l: any) => l.code === "maxClinics");
          if (limitObj && limitObj.value !== undefined) {
            dbLimitValue = limitObj.value;
          }
        }

        const planName = subscription?.subscriptionId?.name?.toLowerCase() || '';
        let maxClinics = 1; // Default
        if (planName.includes('premium')) {
          maxClinics = (dbLimitValue === undefined || dbLimitValue === 0) ? -1 : dbLimitValue;
        } else if (planName.includes('gold')) {
          maxClinics = (dbLimitValue === undefined || dbLimitValue === 0) ? 2 : dbLimitValue;
        } else if (planName.includes('silver')) {
          maxClinics = (dbLimitValue === undefined || dbLimitValue === 0) ? 1 : dbLimitValue;
        } else {
          maxClinics = dbLimitValue !== undefined ? dbLimitValue : 1;
        }

        setMaxAllowedClinics(maxClinics);

        if (maxClinics !== -1 && allActive.length > maxClinics) {
          setShowModal(true);
        } else {
          setShowModal(false);
        }
      } catch (err) {
        console.error("Failed to check clinic limits:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [role]);

  const handleConfirmDeactivation = async () => {
    if (selectedClinicsToKeep.length > maxAllowedClinics) return;

    setProcessing(true);
    try {
      const clinicsToDeactivate = activeClinics.filter(
        (c) => !selectedClinicsToKeep.includes(c._id)
      );

      for (const clinic of clinicsToDeactivate) {
        await updateClinic(clinic._id, { isActive: false });
      }

      setShowModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to deactivate clinics");
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelection = (clinicId: string) => {
    setSelectedClinicsToKeep((prev) => {
      if (prev.includes(clinicId)) {
        return prev.filter((id) => id !== clinicId);
      }
      if (prev.length >= maxAllowedClinics) {
        return prev; // cannot select more
      }
      return [...prev, clinicId];
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[hsl(var(--color-bg-base))] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-[hsl(var(--color-border))] flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--color-danger)/0.1)] to-transparent border-b border-[hsl(var(--color-border))]">
          <div className="w-14 h-14 bg-[hsl(var(--color-danger)/0.1)] rounded-2xl flex items-center justify-center mb-5 border border-[hsl(var(--color-danger)/0.2)]">
            <LuTriangleAlert className="text-[24px] text-[hsl(var(--color-danger))]" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[hsl(var(--color-text))] mb-2">
            Action Required: Subscription Downgrade
          </h2>
          <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
            Your current plan allows for a maximum of <strong>{maxAllowedClinics} active clinic{maxAllowedClinics > 1 ? "s" : ""}</strong>, 
            but you currently have {activeClinics.length} active clinics. Please select which clinic{maxAllowedClinics > 1 ? "s" : ""} to keep active.
            The remaining clinics will be locked but their data will be safely preserved.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-3">
          {activeClinics.map((clinic) => {
            const isSelected = selectedClinicsToKeep.includes(clinic._id);
            const isDisabled = !isSelected && selectedClinicsToKeep.length >= maxAllowedClinics;
            
            return (
              <div
                key={clinic._id}
                onClick={() => !isDisabled && toggleSelection(clinic._id)}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  isDisabled ? "opacity-50 cursor-not-allowed bg-[hsl(var(--color-bg-surface))]" : "cursor-pointer"
                } ${
                  isSelected
                    ? "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.05)]"
                    : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.5)]"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                  isSelected 
                    ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))]" 
                    : "border-[hsl(var(--color-border))]"
                }`}>
                  {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-bg-soft))] flex items-center justify-center text-[hsl(var(--color-text-muted))] shrink-0">
                  <LuBuilding2 className="text-lg" />
                </div>
                <div>
                  <p className="font-bold text-[hsl(var(--color-text))] text-sm">{clinic.name}</p>
                  <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">{clinic.governorate}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">
            Selected: <span className={selectedClinicsToKeep.length === maxAllowedClinics ? "text-[hsl(var(--color-primary))]" : "text-[hsl(var(--color-text))]"} >{selectedClinicsToKeep.length}</span> / {maxAllowedClinics}
          </p>
          <button
            disabled={selectedClinicsToKeep.length === 0 || processing}
            onClick={handleConfirmDeactivation}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white font-bold text-sm shadow-lg shadow-[hsl(var(--color-primary)/0.2)] hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {processing ? "Applying changes..." : "Confirm Selection"}
          </button>
        </div>
      </div>
    </div>
  );
}
