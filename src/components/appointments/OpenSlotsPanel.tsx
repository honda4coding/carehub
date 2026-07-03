"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchClient } from "@/services/fetchClient";
import { LuCalendarClock, LuChevronLeft, LuChevronRight, LuChevronDown, LuChevronUp, LuClock } from "react-icons/lu";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, getWeekOfMonth, startOfWeek, endOfWeek, isSameMonth } from "date-fns";

export default function OpenSlotsPanel({ clinicId, slotsVersion, doctorId }: { clinicId: string, slotsVersion: number, doctorId: string }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const startStr = startOfMonth(currentMonth).toISOString();
        const endStr = endOfMonth(currentMonth).toISOString();
        const res = await fetchClient.get(`/appointmens/available-slots/${doctorId}`, {
          params: { clinicId, startDate: startStr, endDate: endStr }
        });
        setSlots(res.data ?? res);
      } catch (err: any) {
        console.error("Failed to load open slots", err);
      } finally {
        setLoading(false);
      }
    }
    if (doctorId && clinicId) load();
  }, [clinicId, doctorId, slotsVersion, currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => prev.includes(weekNum) ? prev.filter(w => w !== weekNum) : [...prev, weekNum]);
  };

  const toggleDay = (dayStr: string) => {
    setExpandedDays(prev => prev.includes(dayStr) ? prev.filter(d => d !== dayStr) : [...prev, dayStr]);
  };

  // Group slots by week, then by day
  const groupedSlots = useMemo(() => {
    const weeks = new Map<number, any[]>();
    slots.forEach(slot => {
      const d = new Date(slot.startDateTime);
      // We only want slots in the current month, although backend filters it
      if (!isSameMonth(d, currentMonth)) return;
      
      const weekNum = getWeekOfMonth(d);
      if (!weeks.has(weekNum)) weeks.set(weekNum, []);
      weeks.get(weekNum)!.push(slot);
    });

    const result: any[] = [];
    weeks.forEach((weekSlots, weekNum) => {
      // Find start and end date of this week to display
      const firstSlotDate = new Date(weekSlots[0].startDateTime);
      const weekStart = startOfWeek(firstSlotDate);
      const weekEnd = endOfWeek(firstSlotDate);
      
      const days = new Map<string, any[]>();
      weekSlots.forEach(slot => {
        const dStr = format(new Date(slot.startDateTime), "yyyy-MM-dd");
        if (!days.has(dStr)) days.set(dStr, []);
        days.get(dStr)!.push(slot);
      });

      const daysArr = Array.from(days.entries()).map(([dayStr, daySlots]) => ({
        dayStr,
        date: new Date(daySlots[0].startDateTime),
        slots: daySlots
      })).sort((a, b) => a.date.getTime() - b.date.getTime());

      result.push({
        weekNum,
        weekStart,
        weekEnd,
        days: daysArr
      });
    });

    return result.sort((a, b) => a.weekNum - b.weekNum);
  }, [slots, currentMonth]);

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="bg-[hsl(var(--color-bg-subtle))] px-4 md:px-6 py-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuCalendarClock className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg text-[hsl(var(--color-text))]">Open Slots</h3>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-lg p-1">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-[hsl(var(--color-bg-subtle))] rounded-md text-[hsl(var(--color-text-muted))] transition-colors">
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold w-24 text-center text-[hsl(var(--color-text))]">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-[hsl(var(--color-bg-subtle))] rounded-md text-[hsl(var(--color-text-muted))] transition-colors">
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-6 flex-1 flex flex-col overflow-y-auto max-h-[500px]">
        {loading ? (
           <div className="flex items-center justify-center py-8">
             <span className="text-[hsl(var(--color-text-muted))]">Loading slots...</span>
           </div>
        ) : groupedSlots.length === 0 ? (
          <p className="text-sm text-[hsl(var(--color-text-muted))] text-center py-8">
            No open slots found for {format(currentMonth, "MMMM yyyy")}.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
             {groupedSlots.map((week) => (
               <div key={week.weekNum} className="border border-[hsl(var(--color-border))] rounded-lg overflow-hidden bg-[hsl(var(--color-bg-base))]">
                 {/* Week Header */}
                 <button 
                   onClick={() => toggleWeek(week.weekNum)}
                   className="w-full px-4 py-3 flex items-center justify-between bg-[hsl(var(--color-bg-subtle))] hover:bg-[hsl(var(--color-border))] transition-colors"
                 >
                   <div className="flex flex-col items-start">
                     <span className="font-bold text-sm text-[hsl(var(--color-text))]">Week {week.weekNum}</span>
                     <span className="text-[11px] text-[hsl(var(--color-text-muted))]">
                       {format(week.weekStart, "MMM d")} - {format(week.weekEnd, "MMM d")}
                     </span>
                   </div>
                   {expandedWeeks.includes(week.weekNum) ? <LuChevronUp className="text-[hsl(var(--color-text-muted))]" /> : <LuChevronDown className="text-[hsl(var(--color-text-muted))]" />}
                 </button>
                 
                 {/* Week Content (Days) */}
                 {expandedWeeks.includes(week.weekNum) && (
                   <div className="p-3 flex flex-col gap-3 border-t border-[hsl(var(--color-border))]">
                     {week.days.map(day => (
                       <div key={day.dayStr} className="border border-[hsl(var(--color-border))] rounded-md overflow-hidden">
                         {/* Day Header */}
                         <button 
                           onClick={() => toggleDay(day.dayStr)}
                           className="w-full px-3 py-2 flex items-center justify-between hover:bg-[hsl(var(--color-bg-subtle))] transition-colors"
                         >
                           <span className="font-semibold text-sm text-[hsl(var(--color-text))]">{format(day.date, "EEEE, MMM d")}</span>
                           <div className="flex items-center gap-3">
                             <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{day.slots.length} slots</span>
                             {expandedDays.includes(day.dayStr) ? <LuChevronUp className="w-4 h-4 text-[hsl(var(--color-text-muted))]" /> : <LuChevronDown className="w-4 h-4 text-[hsl(var(--color-text-muted))]" />}
                           </div>
                         </button>
                         
                         {/* Day Content (Slots) */}
                         {expandedDays.includes(day.dayStr) && (
                           <div className="p-3 bg-[hsl(var(--color-bg-subtle))] border-t border-[hsl(var(--color-border))]">
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                               {day.slots.map(slot => (
                                 <div key={slot._id} className="flex items-center justify-center gap-1.5 bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded p-2 shadow-sm">
                                   <LuClock className="w-3.5 h-3.5 text-primary" />
                                   <span className="text-xs font-semibold text-[hsl(var(--color-text))]">{format(new Date(slot.startDateTime), "hh:mm a")}</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
