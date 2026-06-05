"use client";

import { useState } from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
import {
  LuActivity,
  LuBell,
  LuClock,
  LuDownload,
  LuFileText,
  LuPill,
  LuSearch,
  LuShieldAlert,
  LuUser
} from "react-icons/lu";

// Static Health Hub Types
interface HealthHubProfile {
  fullName: string;
  nationalIdStatus: "Verified" | "Pending";
  bloodType: string;
  chronicDiseases: string[];
  allergies: string[];
  age: number;
  gender: "Male" | "Female";
  address: string;
  phoneNumber: string;
}

// Timeline Types
interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

interface Encounter {
  id: number;
  date: string;
  doctorName: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  prescriptions: Prescription[];
  clinicalNotes: string;
}

// Initial Data
const INITIAL_PROFILE: HealthHubProfile = {
  fullName: "Sarah Aly Mansour",
  nationalIdStatus: "Verified", // Aligns with Egyptian National ID regex onboarding validation
  bloodType: "A+",
  chronicDiseases: ["Hypertension", "Vitamin D Deficiency"],
  allergies: ["Penicillin", "Peanuts"],
  age: 32,
  gender: "Female",
  address: "Maadi, Cairo, Egypt",
  phoneNumber: "+20 102 345 6789",
};

const ENCOUNTERS: Encounter[] = [
  {
    id: 1,
    date: "22 May 2026 · 10:30 AM",
    doctorName: "Dr. Mohaned Ahmed",
    specialty: "Cardiology",
    chiefComplaint: "Mild chest tightness during light exercise",
    diagnosis: "Initial-stage Hypertension",
    prescriptions: [
      { medication: "Lisinopril 10mg", dosage: "1 Tablet", frequency: "Daily - Morning" },
      { medication: "Atorvastatin 20mg", dosage: "1 Tablet", frequency: "Daily - Bedtime" }
    ],
    clinicalNotes: "Patient advised to reduce daily sodium intake and record blood pressure twice daily. Follow up in two weeks.",
  },
  {
    id: 2,
    date: "10 May 2026 · 02:15 PM",
    doctorName: "Dr. Khaled Taha",
    specialty: "General Medicine",
    chiefComplaint: "Routine annual checkup & blood panel review",
    diagnosis: "Vitamin D3 Deficiency & Mild Fatigue",
    prescriptions: [
      { medication: "Vitamin D3 2000 IU", dosage: "1 Softgel", frequency: "Daily - Morning (With Fat-containing meal)" }
    ],
    clinicalNotes: "Advised increasing dietary rich foods (fish, eggs) and direct sunlight exposure for 15 minutes daily.",
  },
  {
    id: 3,
    date: "15 April 2026 · 11:00 AM",
    doctorName: "Dr. Dalia Fawzy",
    specialty: "Ophthalmology",
    chiefComplaint: "Slight strain and blurred text when reading screens",
    diagnosis: "Mild Presbyopia & Digital Eye Strain",
    prescriptions: [
      { medication: "Reading Glasses", dosage: "+1.00 Diopter", frequency: "As needed for reading" },
      { medication: "Systane Ultra Eye Drops", dosage: "1 Drop in each eye", frequency: "3 times daily" }
    ],
    clinicalNotes: "Take 20-second breaks looking 20 feet away every 20 minutes (20-20-20 rule). Re-evaluate vision in 12 months.",
  }
];

export default function PatientDashboard() {
  /**
   * TODO: BAKRI (Task 2: [Patient] Live Core Metrics & Timeline)
   * 
   * 1. Trigger an Axios GET request to retrieve the patient profile:
   *    - Endpoint: GET /patient/profile (or /users/profile)
   *    - Fetch variables: bloodType, chronicDiseases, allergies, fullName, age, gender, address, phoneNumber.
   *    - Bind to `profile` state.
   * 2. Replace hardcoded ENCOUNTERS array with dynamic API requests:
   *    - Fetch Encounters from: GET /medical-history/:patientId
   *    - Fetch Prescriptions from: GET /prescrption/patient/:patientId
   *    - Chronologically merge them into a single sorted timeline representation.
   * 3. Handle asynchronous states:
   *    - Render loading spinners / pulse skeletons while fetching.
   *    - Handle Axios error responses gracefully with toast alerts.
   */
  const [profile, setProfile] = useState<HealthHubProfile>(INITIAL_PROFILE);
  const [searchTerm, setSearchTerm] = useState("");



  // Filter encounters
  const encounters = ENCOUNTERS;
  const filteredEncounters = encounters.filter((e) =>
    e.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Topbar Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
            Welcome back, {profile.fullName.split(" ")[0]}!
          </h1>
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
            Saturday, 23 May 2026 · CareHub Medical Record
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:flex">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[hsl(var(--color-text-muted))]" />
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-[10px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] outline-none w-[200px] focus:border-[hsl(var(--color-primary)/0.5)] transition-colors"
            />
          </div>

          <button className="w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] flex items-center justify-center relative hover:bg-[hsl(var(--color-bg-soft))] transition-all">
            <LuBell className="text-[15px]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-secondary-strong))]" />
          </button>

          <button className="hidden sm:flex w-[34px] h-[34px] rounded-[10px] border border-[hsl(var(--color-border))] items-center justify-center hover:bg-[hsl(var(--color-bg-soft))] transition-all">
            <IoIosHelpCircleOutline className="text-[15px]" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">

        {/* 1. CENTRALIZED HEALTH HUB (Static Health Data) */}
        <section className="mb-6">
          <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3 flex items-center gap-1.5">
            <LuUser className="text-[14px]" /> Centralized Health Hub
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Quick Profile Bio */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <p className="text-[16px] font-black text-[hsl(var(--color-text))] leading-tight">
                    {profile.fullName}
                  </p>
                  <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] uppercase">
                    {profile.nationalIdStatus}
                  </span>
                </div>
                <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-1">
                  National ID Verified · Egyptian Citizen
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-[hsl(var(--color-text))]">
                  <span className="bg-[hsl(var(--color-bg-soft))] px-2 py-1 rounded-md">
                    Age: {profile.age} yrs
                  </span>
                  <span className="bg-[hsl(var(--color-bg-soft))] px-2 py-1 rounded-md">
                    Gender: {profile.gender}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[hsl(var(--color-border-soft))] text-[10px] text-[hsl(var(--color-text-muted))]">
                <p className="font-bold text-[hsl(var(--color-text))]">Contact Details:</p>
                <p className="mt-1">{profile.phoneNumber}</p>
                <p>{profile.address}</p>
              </div>
            </div>

            {/* Blood Type Card */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">
                  Blood Group
                </p>
                <span className="text-[11px] text-red-500">❤️</span>
              </div>
              <div className="my-2">
                <p className="text-[36px] font-black text-[hsl(var(--color-text))] leading-none">
                  {profile.bloodType}
                </p>
                <p className="text-[10px] font-bold text-[hsl(var(--color-success))] mt-1.5 flex items-center gap-1">
                  ● Compatible Donor
                </p>
              </div>
              <p className="text-[10px] text-[hsl(var(--color-text-muted))] leading-tight">
                Crucial parameter stored securely for trauma or emergency transfusion guidance.
              </p>
            </div>

            {/* Chronic Diseases */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">
                  Chronic Diseases
                </p>
                <LuActivity className="text-[14px] text-[hsl(var(--color-primary))]" />
              </div>
              <div className="my-2 flex flex-col gap-1.5">
                {profile.chronicDiseases.map((disease) => (
                  <span
                    key={disease}
                    className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning))]"
                  >
                    ● {disease}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[hsl(var(--color-text-muted))] leading-tight">
                Synced with direct clinical records generated during doctor consultations.
              </p>
            </div>

            {/* Allergies */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">
                  Allergies
                </p>
                <LuShieldAlert className="text-[14px] text-[hsl(var(--color-danger))]" />
              </div>
              <div className="my-2 flex flex-wrap gap-1.5">
                {profile.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))]"
                  >
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[hsl(var(--color-text-muted))] leading-tight">
                Alerts medical personnel prior to clinical prescription generation to prevent reactions.
              </p>
            </div>

          </div>
        </section>



        {/* 3. MEDICAL TIMELINE & CLINICAL ACTIONS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Chronological Medical Timeline */}
          <div className="xl:col-span-2">
            <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3 flex items-center gap-1.5">
              <LuClock className="text-[14px]" /> The Medical Timeline
            </h2>

            <div className="flex flex-col gap-4">
              {filteredEncounters.length === 0 ? (
                <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center">
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] font-bold">
                    No encounters matched your search filters.
                  </p>
                </div>
              ) : (
                filteredEncounters.map((enc) => (
                  <div
                    key={enc.id}
                    className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5"
                  >
                    
                    {/* Encounter Header */}
                    <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[hsl(var(--color-border-soft))] pb-3 mb-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-[hsl(var(--color-text-muted))] uppercase">
                          {enc.date}
                        </span>
                        <h3 className="text-[14px] font-black text-[hsl(var(--color-text))]">
                          Encounter with {enc.doctorName}
                        </h3>
                        <p className="text-[10px] font-bold text-[hsl(var(--color-primary-strong))] uppercase tracking-wider">
                          {enc.specialty}
                        </p>
                      </div>

                      <div className="bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] text-[10px] font-black px-2.5 py-1 rounded-full">
                        Chief Complaint: {enc.chiefComplaint}
                      </div>
                    </div>

                    {/* Encounter details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Diagnosis & Notes */}
                      <div>
                        <div>
                          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase">
                            Clinical Diagnosis
                          </p>
                          <p className="text-[12px] font-bold text-[hsl(var(--color-text))] mt-0.5">
                            {enc.diagnosis}
                          </p>
                        </div>

                        <div className="mt-3">
                          <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase">
                            Doctor's Consultation Notes
                          </p>
                          <p className="text-[11px] text-[hsl(var(--color-text-muted))] leading-relaxed mt-0.5">
                            {enc.clinicalNotes}
                          </p>
                        </div>
                      </div>

                      {/* Right: Issued Prescriptions */}
                      <div className="bg-[hsl(var(--color-bg-soft))] rounded-xl p-3 border border-[hsl(var(--color-border-soft))]">
                        <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <LuPill className="text-xs" /> Issued Prescriptions:
                        </p>

                        <div className="flex flex-col gap-2">
                          {enc.prescriptions.map((rx, idx) => (
                            <div
                              key={idx}
                              className="bg-[hsl(var(--color-bg-surface))] rounded-lg p-2 border border-[hsl(var(--color-border-soft))] flex items-center justify-between"
                            >
                              <div>
                                <p className="text-[11px] font-black text-[hsl(var(--color-text))]">
                                  {rx.medication}
                                </p>
                                <p className="text-[9px] text-[hsl(var(--color-text-muted))] mt-0.5">
                                  Dosage: {rx.dosage}
                                </p>
                              </div>
                              <span className="text-[9px] font-black bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))] px-2 py-0.5 rounded">
                                {rx.frequency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-wider text-[hsl(var(--color-text))] mb-3">
              Patient Workspace Actions
            </h2>

            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-4 flex flex-col gap-3">
              
              <button className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-soft))] transition-all flex items-center gap-3 text-left cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] flex items-center justify-center text-sm">
                  <LuDownload />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-success))] transition-colors">
                    Download Health Record
                  </p>
                  <p className="text-[9px] text-[hsl(var(--color-text-muted))] mt-0.5">
                    Get fully compiled PDF history
                  </p>
                </div>
              </button>

              <div className="mt-2 p-3 bg-[hsl(var(--color-bg-soft))] rounded-xl border border-[hsl(var(--color-border-soft))] flex items-start gap-2.5">
                <LuFileText className="text-base text-[hsl(var(--color-primary-strong))] mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-[hsl(var(--color-text))]">
                    National ID Registration
                  </p>
                  <p className="text-[9px] text-[hsl(var(--color-text-muted))] leading-tight mt-0.5">
                    Your profile is securely locked to National ID status to enforce absolute system integrity.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
