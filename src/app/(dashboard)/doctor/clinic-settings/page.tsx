"use client";

import { useState } from "react";
import { LuSettings, LuSave } from "react-icons/lu";

import WorkingHoursSetup, { ScheduleDay } from "@/components/doctor/clinic-settings/WorkingHoursSetup";
import ConsultationRules from "@/components/doctor/clinic-settings/ConsultationRules";
import ServicesPricing, { ClinicService } from "@/components/doctor/clinic-settings/ServicesPricing";

// Dummy Data
const INITIAL_SCHEDULE: ScheduleDay[] = [
  { day: "Saturday", active: true, open: "09:00", close: "17:00" },
  { day: "Sunday", active: true, open: "09:00", close: "17:00" },
  { day: "Monday", active: true, open: "09:00", close: "17:00" },
  { day: "Tuesday", active: true, open: "09:00", close: "17:00" },
  { day: "Wednesday", active: true, open: "09:00", close: "17:00" },
  { day: "Thursday", active: true, open: "09:00", close: "13:00" },
  { day: "Friday", active: false, open: "00:00", close: "00:00" },
];

const INITIAL_SERVICES: ClinicService[] = [
  { id: 1, name: "General Consultation", price: "300" },
  { id: 2, name: "Follow-up", price: "100" },
  { id: 3, name: "Ultrasound", price: "200" },
];

export default function ClinicManagementPage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>(INITIAL_SCHEDULE);
  const [services, setServices] = useState<ClinicService[]>(INITIAL_SERVICES);

  // Settings
  const [avgTime, setAvgTime] = useState("15");
  const [dailyLimit, setDailyLimit] = useState("30");
  const [allowWalkIns, setAllowWalkIns] = useState(true);

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
            <LuSettings className="text-[hsl(var(--color-primary))]" /> Clinic
            Settings
          </h1>
          <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mt-1 pl-11 md:pl-0">
            Manage your working hours, consultation rules, and services pricing
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-4 py-2 rounded-xl shadow-[0_4px_12px_hsl(var(--color-primary)/0.3)] hover:scale-[1.02] transition-transform flex items-center gap-2 cursor-pointer"
        >
          <LuSave className="text-lg" /> Save Changes
        </button>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Section 1: Working Hours */}
          <WorkingHoursSetup
            schedule={schedule}
            setSchedule={setSchedule}
          />

          {/* Column 2 & 3 wrapper */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 2: Consultation Rules */}
            <ConsultationRules
              avgTime={avgTime}
              setAvgTime={setAvgTime}
              dailyLimit={dailyLimit}
              setDailyLimit={setDailyLimit}
              allowWalkIns={allowWalkIns}
              setAllowWalkIns={setAllowWalkIns}
            />

            {/* Section 3: Services & Pricing */}
            <ServicesPricing
              services={services}
              setServices={setServices}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
