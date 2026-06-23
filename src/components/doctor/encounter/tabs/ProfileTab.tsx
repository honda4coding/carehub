"use client";

import PatientInsightsCard from "@/components/doctor/encounter/PatientInsightsCard";
import VitalsPanel from "@/components/doctor/encounter/VitalsPanel";
import MedicalAlertsPanel from "@/components/doctor/encounter/MedicalAlertsPanel";
import PastSurgeriesPanel from "@/components/doctor/encounter/PastSurgeriesPanel";
import DoctorVitalsCharts from "@/components/doctor/encounter/DoctorVitalsCharts";

export interface ProfileTabProps {
  loading: boolean;
  patientData: any;
  fullMedicalHistory: any[];
  
  isEditVitalsOpen: boolean;
  setIsEditVitalsOpen: (val: boolean) => void;
  editHeight: string; setEditHeight: (val: string) => void;
  editWeight: string; setEditWeight: (val: string) => void;
  editBloodPressure: string; setEditBloodPressure: (val: string) => void;
  editSugarLevel: string; setEditSugarLevel: (val: string) => void;
  editPulse: string; setEditPulse: (val: string) => void;
  editTemperature: string; setEditTemperature: (val: string) => void;
  editBloodType: string; setEditBloodType: (val: string) => void;
  saveVitalsLocally: () => void;
  lastVisitVitals: any;

  isEditAlertsOpen: boolean;
  setIsEditAlertsOpen: (val: boolean) => void;
  editAllergies: string; setEditAllergies: (val: string) => void;
  editChronic: string; setEditChronic: (val: string) => void;
  saveAlerts: () => void;

  isEditSurgeriesOpen: boolean;
  setIsEditSurgeriesOpen: (val: boolean) => void;
  editSurgeries: any[]; setEditSurgeries: (val: any[]) => void;
  saveSurgeries: () => void;
  
  isSavingAlerts: boolean;
}

export default function ProfileTab(props: ProfileTabProps) {
  const {
    loading, patientData, fullMedicalHistory,
    isEditVitalsOpen, setIsEditVitalsOpen,
    editHeight, setEditHeight,
    editWeight, setEditWeight,
    editBloodPressure, setEditBloodPressure,
    editSugarLevel, setEditSugarLevel,
    editPulse, setEditPulse,
    editTemperature, setEditTemperature,
    editBloodType, setEditBloodType,
    saveVitalsLocally, lastVisitVitals,
    isEditAlertsOpen, setIsEditAlertsOpen,
    editAllergies, setEditAllergies,
    editChronic, setEditChronic,
    saveAlerts,
    isEditSurgeriesOpen, setIsEditSurgeriesOpen,
    editSurgeries, setEditSurgeries,
    saveSurgeries,
    isSavingAlerts
  } = props;

  return (
    <div className="flex flex-col gap-6">
      {patientData?._id && (
        <PatientInsightsCard patientId={patientData._id} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VitalsPanel 
          loading={loading}
          patientData={patientData}
          isEditVitalsOpen={isEditVitalsOpen}
          setIsEditVitalsOpen={setIsEditVitalsOpen}
          editHeight={editHeight}
          setEditHeight={setEditHeight}
          editWeight={editWeight}
          setEditWeight={setEditWeight}
          editBloodPressure={editBloodPressure}
          setEditBloodPressure={setEditBloodPressure}
          editSugarLevel={editSugarLevel}
          setEditSugarLevel={setEditSugarLevel}
          editPulse={editPulse}
          setEditPulse={setEditPulse}
          editTemperature={editTemperature}
          setEditTemperature={setEditTemperature}
          editBloodType={editBloodType}
          setEditBloodType={setEditBloodType}
          saveVitalsLocally={saveVitalsLocally}
          lastVisitVitals={lastVisitVitals}
        />
        <div className="space-y-6">
          <MedicalAlertsPanel 
            loading={loading}
            patientData={patientData}
            isEditAlertsOpen={isEditAlertsOpen}
            setIsEditAlertsOpen={setIsEditAlertsOpen}
            editAllergies={editAllergies}
            setEditAllergies={setEditAllergies}
            editChronic={editChronic}
            setEditChronic={setEditChronic}
            saveAlerts={saveAlerts}
            isSaving={isSavingAlerts}
          />
          <PastSurgeriesPanel 
            loading={loading}
            patientData={patientData}
            isEditSurgeriesOpen={isEditSurgeriesOpen}
            setIsEditSurgeriesOpen={setIsEditSurgeriesOpen}
            editSurgeries={editSurgeries}
            setEditSurgeries={setEditSurgeries}
            saveSurgeries={saveSurgeries}
            isSaving={isSavingAlerts}
          />
        </div>
      </div>
      
      <DoctorVitalsCharts history={fullMedicalHistory} />
    </div>
  );
}
