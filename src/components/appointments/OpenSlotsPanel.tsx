"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isSameMonth, startOfWeek, endOfWeek, getWeekOfMonth, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { LuCalendarClock, LuChevronLeft, LuChevronRight, LuChevronDown, LuChevronUp, LuTrash2, LuClock } from "react-icons/lu";
import { deleteDoctorSlot, deleteMultipleDoctorSlots, getAvailableSlots } from "@/services/appointmentService";

export default function OpenSlotsPanel({ clinicId, slotsVersion, doctorId }: { clinicId: string, slotsVersion: number, doctorId: string }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  
  const [slotsByDay, setSlotsByDay] = useState<Record<string, any[]>>({});
  const [loadingDays, setLoadingDays] = useState<Record<string, boolean>>({});

  // Reset state when version or month changes
  useEffect(() => {
    setSlotsByDay({});
    setExpandedDays([]);
    setExpandedWeeks([]);
  }, [slotsVersion, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => startOfMonth(new Date(prev.getFullYear(), prev.getMonth() - 1, 1)));
  const handleNextMonth = () => setCurrentMonth(prev => startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)));

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => prev.includes(weekNum) ? prev.filter(w => w !== weekNum) : [...prev, weekNum]);
  };

  const toggleDay = async (dayStr: string, date: Date) => {
    const isExpanding = !expandedDays.includes(dayStr);
    
    if (isExpanding) {
      setExpandedDays(prev => [...prev, dayStr]);
      
      // Lazy fetch if we don't have the slots for this day
      if (!slotsByDay[dayStr]) {
        setLoadingDays(prev => ({ ...prev, [dayStr]: true }));
        try {
          if (!doctorId || doctorId === "undefined") {
            console.warn("OpenSlotsPanel: doctorId is missing or invalid", doctorId);
            setLoadingDays(prev => ({ ...prev, [dayStr]: false }));
            return;
          }
          // Force Turbopack to recompile!
          const startStr = startOfDay(date).toISOString();
          const endStr = endOfDay(date).toISOString();
          const res = await getAvailableSlots(doctorId, {
            clinicId, startDate: startStr, endDate: endStr, includeBooked: "true", limit: 500
          });
          console.log(`[OpenSlotsPanel] getAvailableSlots res for ${dayStr}:`, res);
          const anyRes = res as any;
          const daySlots = anyRes?.slots || anyRes?.data?.slots || res || [];
          setSlotsByDay(prev => ({ ...prev, [dayStr]: Array.isArray(daySlots) ? daySlots : [] }));
        } catch (err) {
          console.error(`Failed to load slots for ${dayStr}`, err);
          setSlotsByDay(prev => ({ ...prev, [dayStr]: [] })); // Set empty to prevent infinite loading
        } finally {
          setLoadingDays(prev => ({ ...prev, [dayStr]: false }));
        }
      }
    } else {
      setExpandedDays(prev => prev.filter(d => d !== dayStr));
    }
  };

  // Generate the weeks and days statically for the month
  const monthWeeks = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const weeksMap = new Map<number, any[]>();
    
    days.forEach(date => {
      const dayOfMonth = date.getDate();
      let weekNum = 1;
      if (dayOfMonth >= 1 && dayOfMonth <= 7) weekNum = 1;
      else if (dayOfMonth >= 8 && dayOfMonth <= 14) weekNum = 2;
      else if (dayOfMonth >= 15 && dayOfMonth <= 21) weekNum = 3;
      else weekNum = 4; // Days 22+ go into Week 4
      
      if (!weeksMap.has(weekNum)) weeksMap.set(weekNum, []);
      weeksMap.get(weekNum)!.push(date);
    });

    const result: any[] = [];
    const today = startOfDay(new Date());

    weeksMap.forEach((weekDays, weekNum) => {
      // Filter out past days
      const validDays = weekDays.filter(d => d >= today);
      if (validDays.length === 0) return;

      const weekStart = validDays[0];
      const weekEnd = validDays[validDays.length - 1];
      
      const formattedDays = validDays.map(date => ({
        date,
        dayStr: format(date, "yyyy-MM-dd")
      }));

      result.push({
        weekNum,
        weekStart,
        weekEnd,
        days: formattedDays
      });
    });

    return result.sort((a, b) => a.weekNum - b.weekNum);
  }, [currentMonth]);

  const handleDeleteSlot = async (e: React.MouseEvent, slot: any, dayStr: string) => {
    e.stopPropagation();
    
    if (slot.isBooked) {
      if (!window.confirm(`WARNING: This slot is booked! Deleting it will cancel the patient's appointment. Are you absolutely sure?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Delete this open slot at ${format(new Date(slot.startDateTime), "hh:mm a")}?`)) {
        return;
      }
    }

    try {
      await deleteDoctorSlot(slot._id);
      setSlotsByDay(prev => ({
        ...prev,
        [dayStr]: prev[dayStr].filter((s: any) => s._id !== slot._id)
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete slot");
    }
  };

  const handleDeleteDaySlots = async (dayStr: string) => {
    const daySlots = slotsByDay[dayStr] || [];
    if (daySlots.length === 0) return;
    
    const bookedCount = daySlots.filter(s => s.isBooked).length;
    let msg = `Are you sure you want to delete all ${daySlots.length} slots for this day?`;
    if (bookedCount > 0) {
      msg = `WARNING: You are about to delete ${daySlots.length} slots, including ${bookedCount} BOOKED APPOINTMENTS which will be cancelled! Are you absolutely sure?`;
    }

    if (!window.confirm(msg)) {
      return;
    }

    try {
      const slotIds = daySlots.map(s => s._id);
      await deleteMultipleDoctorSlots(slotIds);
      setSlotsByDay(prev => ({
        ...prev,
        [dayStr]: []
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete day slots");
    }
  };

  const handleDeleteWeekSlots = async (week: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let allSlots: any[] = [];
    week.days.forEach((day: any) => {
      if (slotsByDay[day.dayStr]) {
        allSlots.push(...slotsByDay[day.dayStr]);
      }
    });

    if (allSlots.length === 0) {
      alert("Please expand the days first to load the slots before deleting the entire week.");
      return;
    }

    const bookedCount = allSlots.filter(s => s.isBooked).length;
    let msg = `Are you sure you want to delete all ${allSlots.length} loaded slots for this week?`;
    if (bookedCount > 0) {
      msg = `WARNING: You are about to delete ${allSlots.length} slots for this week, including ${bookedCount} BOOKED APPOINTMENTS which will be cancelled! Are you absolutely sure?`;
    }

    if (!window.confirm(msg)) {
      return;
    }

    try {
      const slotIds = allSlots.map(s => s._id);
      await deleteMultipleDoctorSlots(slotIds);
      
      const newSlotsByDay = { ...slotsByDay };
      week.days.forEach((day: any) => {
        if (newSlotsByDay[day.dayStr]) {
          newSlotsByDay[day.dayStr] = [];
        }
      });
      setSlotsByDay(newSlotsByDay);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to delete week slots");
    }
  };

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="bg-[hsl(var(--color-bg-subtle))] px-4 md:px-6 py-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuCalendarClock className="w-5 h-5 text-[hsl(var(--color-primary))]" />
          <h3 className="font-bold text-lg text-[hsl(var(--color-text))]">Open Slots Explorer</h3>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-xl p-1 shadow-sm">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-[hsl(var(--color-bg-subtle))] rounded-lg text-[hsl(var(--color-text-muted))] transition-colors">
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold w-24 text-center text-[hsl(var(--color-text))]">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-[hsl(var(--color-bg-subtle))] rounded-lg text-[hsl(var(--color-text-muted))] transition-colors">
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-6 flex-1 flex flex-col overflow-y-auto max-h-[600px] bg-[hsl(var(--color-bg-base))]">
        <div className="flex flex-col gap-4">
            {monthWeeks.map((week) => (
              <div key={week.weekNum} className="border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden bg-[hsl(var(--color-bg-surface))] shadow-sm transition-all">
                {/* Week Header */}
                <div 
                  onClick={() => toggleWeek(week.weekNum)}
                  className="w-full px-5 py-4 flex items-center justify-between bg-[hsl(var(--color-bg-surface))] hover:bg-[hsl(var(--color-primary)/0.03)] transition-colors cursor-pointer group"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-[15px] text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">Week {week.weekNum}</span>
                    <span className="text-[12px] font-medium text-[hsl(var(--color-text-muted))] mt-0.5">
                      {format(week.weekStart, "MMM d")} - {format(week.weekEnd, "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDeleteWeekSlots(week, e)}
                      className="p-1.5 mr-2 text-[hsl(var(--color-text-muted))] hover:text-white hover:bg-[hsl(var(--color-danger))] rounded-lg transition-colors shadow-sm bg-[hsl(var(--color-danger)/0.1)] border border-[hsl(var(--color-danger)/0.2)]"
                      title="Delete All Loaded Slots in Week"
                    >
                      <LuTrash2 className="w-4 h-4 text-[hsl(var(--color-danger))]" />
                    </button>
                    {expandedWeeks.includes(week.weekNum) ? <LuChevronUp className="w-5 h-5 text-[hsl(var(--color-text-muted))]" /> : <LuChevronDown className="w-5 h-5 text-[hsl(var(--color-text-muted))]" />}
                  </div>
                </div>
                
                {/* Week Content (Days) */}
                {expandedWeeks.includes(week.weekNum) && (
                  <div className="flex flex-col border-t border-[hsl(var(--color-border))]">
                    {week.days.map((day: any) => {
                      const isExpanded = expandedDays.includes(day.dayStr);
                      const isLoading = loadingDays[day.dayStr];
                      const daySlots = slotsByDay[day.dayStr];
                      
                      return (
                        <div key={day.dayStr} className="border-b border-[hsl(var(--color-border))] last:border-b-0">
                          {/* Day Header - Indented */}
                          <div 
                            onClick={() => toggleDay(day.dayStr, day.date)}
                            className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-[hsl(var(--color-primary)/0.04)] transition-colors cursor-pointer border-l-4 ${isExpanded ? 'bg-[hsl(var(--color-primary)/0.02)] border-[hsl(var(--color-primary))]' : 'border-transparent'}`}
                          >
                            <div className="flex items-center gap-3 pl-2">
                              <span className={`font-bold text-[14px] ${isExpanded ? 'text-[hsl(var(--color-primary))]' : 'text-[hsl(var(--color-text))]'}`}>
                                {format(day.date, "EEEE, MMM d")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 pr-2">
                              {daySlots && (
                                <span className="text-[11px] font-bold text-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.1)] px-2.5 py-1 rounded-full">
                                  {daySlots.length} slots
                                </span>
                              )}
                              {isExpanded ? <LuChevronUp className="w-4 h-4 text-[hsl(var(--color-text-muted))]" /> : <LuChevronDown className="w-4 h-4 text-[hsl(var(--color-text-muted))]" />}
                            </div>
                          </div>
                          
                          {/* Day Content (Slots) - Deeply Indented */}
                          {isExpanded && (
                            <div className="p-5 pl-10 bg-[hsl(var(--color-bg-base))] border-l-4 border-[hsl(var(--color-primary)/0.2)]">
                              {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-6 gap-3">
                                  <LuClock className="w-5 h-5 text-[hsl(var(--color-primary))] animate-spin" />
                                  <span className="text-[12px] font-bold text-[hsl(var(--color-primary))] animate-pulse">Fetching slots...</span>
                                </div>
                              ) : daySlots && daySlots.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[hsl(var(--color-bg-surface))] p-3 rounded-xl border border-[hsl(var(--color-border))]">
                                    <h4 className="text-sm font-bold text-[hsl(var(--color-text-muted))]">
                                      Generated Slots ({daySlots.filter((s:any)=>!s.isBooked).length} Open, {daySlots.filter((s:any)=>s.isBooked).length} Booked)
                                    </h4>
                                    {daySlots.length > 0 && (
                                      <button 
                                        onClick={() => handleDeleteDaySlots(day.dayStr)}
                                        className="text-xs font-bold text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger))] hover:text-white border border-[hsl(var(--color-danger)/0.3)] hover:border-transparent px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                                      >
                                        <LuTrash2 className="w-3.5 h-3.5" />
                                        Delete All Slots
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {daySlots.map((slot: any) => (
                                      <div key={slot._id} className={`flex flex-col gap-2 border rounded-xl p-3 shadow-sm transition-all hover:shadow-md ${slot.isBooked ? 'bg-red-50 border-red-200' : 'bg-white border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)/0.5)]'}`}>
                                        <div className="flex items-center gap-2">
                                            <LuClock className={`w-3.5 h-3.5 ${slot.isBooked ? 'text-red-500' : 'text-[hsl(var(--color-primary))]'}`} />
                                            <span className={`text-[13px] font-bold ${slot.isBooked ? 'text-red-700' : 'text-[hsl(var(--color-text))]'}`}>
                                                {format(new Date(slot.startDateTime), "hh:mm a")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                          <span className={`text-[10px] font-bold uppercase tracking-wider ${slot.isBooked ? 'text-red-600' : 'text-[hsl(var(--color-success))]'}`}>
                                              {slot.isBooked ? "Booked" : "Open"}
                                          </span>
                                          <button 
                                              onClick={(e) => handleDeleteSlot(e, slot, day.dayStr)}
                                              className="p-1.5 text-[hsl(var(--color-text-muted))] hover:text-white hover:bg-[hsl(var(--color-danger))] rounded-lg transition-colors shadow-sm"
                                              title={slot.isBooked ? "Cancel Appointment & Delete Slot" : "Delete Slot"}
                                          >
                                              <LuTrash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] py-4">
                                  No open slots generated for this day.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
