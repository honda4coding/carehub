"use client";

import { useState } from "react";
import { 
  LuSettings, LuClock, LuUsers, LuStethoscope, 
  LuSave, LuPlus, LuTrash2, LuCalendarDays
} from "react-icons/lu";

// Dummy Data
const INITIAL_SCHEDULE = [
  { day: "Saturday", active: true, open: "09:00", close: "17:00" },
  { day: "Sunday", active: true, open: "09:00", close: "17:00" },
  { day: "Monday", active: true, open: "09:00", close: "17:00" },
  { day: "Tuesday", active: true, open: "09:00", close: "17:00" },
  { day: "Wednesday", active: true, open: "09:00", close: "17:00" },
  { day: "Thursday", active: true, open: "09:00", close: "13:00" },
  { day: "Friday", active: false, open: "00:00", close: "00:00" },
];

const INITIAL_SERVICES = [
  { id: 1, name: "General Consultation", price: "300" },
  { id: 2, name: "Follow-up", price: "100" },
  { id: 3, name: "Ultrasound", price: "200" },
];

export default function ClinicManagementPage() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [services, setServices] = useState(INITIAL_SERVICES);
  
  // Settings
  const [avgTime, setAvgTime] = useState("15");
  const [dailyLimit, setDailyLimit] = useState("30");
  const [allowWalkIns, setAllowWalkIns] = useState(true);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
            <LuSettings className="text-primary" /> Clinic Settings
          </h1>
          <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mt-1 pl-11 md:pl-0">
            Manage your working hours, consultation rules, and services pricing
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary text-white text-[12px] font-bold px-4 py-2 rounded-xl shadow-[0_4px_12px_hsl(var(--color-primary)/0.3)] hover:scale-[1.02] transition-transform flex items-center gap-2"
        >
          <LuSave className="text-lg" /> Save Changes
        </button>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Section 1: Working Hours */}
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center text-primary">
                <LuCalendarDays />
              </div>
              <h2 className="text-[14px] font-black uppercase text-[hsl(var(--color-text))]">Working Hours</h2>
            </div>

            <div className="space-y-3">
              {schedule.map((day, idx) => (
                <div key={day.day} className={`p-3 rounded-xl border ${day.active ? 'border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-primary)/0.02)]' : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] opacity-60'} transition-colors`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={day.active} 
                        onChange={() => toggleDay(idx)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-[13px] font-bold text-[hsl(var(--color-text))]">{day.day}</span>
                    </label>
                    {!day.active && <span className="text-[10px] font-bold text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.1)] px-2 py-0.5 rounded-md">Closed</span>}
                  </div>
                  
                  {day.active && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        value={day.open}
                        onChange={(e) => {
                          const newSch = [...schedule];
                          newSch[idx].open = e.target.value;
                          setSchedule(newSch);
                        }}
                        className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[12px] font-medium rounded-lg px-2 py-1 outline-none"
                      />
                      <span className="text-[hsl(var(--color-text-muted))] text-xs">to</span>
                      <input 
                        type="time" 
                        value={day.close}
                        onChange={(e) => {
                          const newSch = [...schedule];
                          newSch[idx].close = e.target.value;
                          setSchedule(newSch);
                        }}
                        className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[12px] font-medium rounded-lg px-2 py-1 outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 & 3 wrapper */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 2: Consultation Rules */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-warning-bg))] flex items-center justify-center text-[hsl(var(--color-warning))]">
                  <LuClock />
                </div>
                <h2 className="text-[14px] font-black uppercase text-[hsl(var(--color-text))]">Consultation Rules</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wide">
                    Average Consultation Time (mins)
                  </label>
                  <input 
                    type="number" 
                    value={avgTime}
                    onChange={(e) => setAvgTime(e.target.value)}
                    className="w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[13px] font-bold rounded-xl px-4 py-2 outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-1">Used to calculate booking slots.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-wide">
                    Daily Patient Limit
                  </label>
                  <input 
                    type="number" 
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-[13px] font-bold rounded-xl px-4 py-2 outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[10px] text-[hsl(var(--color-text-muted))] mt-1">Maximum walk-in patients per day.</p>
                </div>

                <div className="md:col-span-2 mt-2 p-4 rounded-xl border border-[hsl(var(--color-border))] flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[hsl(var(--color-text))] flex items-center gap-2">
                      <LuUsers /> Allow Walk-ins
                    </h3>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5">
                      Accept patients without prior online booking.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={allowWalkIns}
                      onChange={() => setAllowWalkIns(!allowWalkIns)}
                    />
                    <div className="w-11 h-6 bg-[hsl(var(--color-border))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3: Services & Pricing */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-success-bg))] flex items-center justify-center text-[hsl(var(--color-success))]">
                    <LuStethoscope />
                  </div>
                  <h2 className="text-[14px] font-black uppercase text-[hsl(var(--color-text))]">Services & Pricing</h2>
                </div>
                <button className="text-[11px] font-bold bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <LuPlus /> Add Service
                </button>
              </div>

              <div className="w-full">
                {/* Mobile View: Cards */}
                <div className="md:hidden flex flex-col gap-3 mt-2">
                  {services.map((service, index) => (
                    <div key={service.id} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">Service Name</span>
                        <button className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] p-1 rounded-md transition-colors bg-[hsl(var(--color-danger)/0.05)] hover:bg-[hsl(var(--color-danger)/0.1)]">
                          <LuTrash2 className="text-[14px]" />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={service.name}
                        onChange={(e) => {
                          const newSvc = [...services];
                          newSvc[index].name = e.target.value;
                          setServices(newSvc);
                        }}
                        className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] outline-none text-[13px] font-bold text-[hsl(var(--color-text))] w-full px-3 py-2 rounded-lg focus:border-primary"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">Price (EGP):</span>
                        <input 
                          type="number" 
                          value={service.price}
                          onChange={(e) => {
                            const newSvc = [...services];
                            newSvc[index].price = e.target.value;
                            setServices(newSvc);
                          }}
                          className="bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] outline-none text-[13px] font-bold text-[hsl(var(--color-text))] flex-1 px-3 py-2 rounded-lg focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto border border-[hsl(var(--color-border))] rounded-xl">
                  <table className="w-full text-left">
                    <thead className="bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))]">
                      <tr>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">Service Name</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))]">Price (EGP)</th>
                        <th className="px-4 py-3 text-[11px] font-bold uppercase text-[hsl(var(--color-text-muted))] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, index) => (
                        <tr key={service.id} className="border-b border-[hsl(var(--color-border))] last:border-0 hover:bg-[hsl(var(--color-bg-soft)/0.5)]">
                          <td className="px-4 py-3">
                            <input 
                              type="text" 
                              value={service.name}
                              onChange={(e) => {
                                const newSvc = [...services];
                                newSvc[index].name = e.target.value;
                                setServices(newSvc);
                              }}
                              className="bg-transparent border-0 outline-none text-[13px] font-bold text-[hsl(var(--color-text))] w-full"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">EGP</span>
                              <input 
                                type="number" 
                                value={service.price}
                                onChange={(e) => {
                                  const newSvc = [...services];
                                  newSvc[index].price = e.target.value;
                                  setServices(newSvc);
                                }}
                                className="bg-transparent border-0 outline-none text-[13px] font-bold text-[hsl(var(--color-text))] w-20"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] p-1.5 rounded-lg transition-colors">
                              <LuTrash2 className="text-[14px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
