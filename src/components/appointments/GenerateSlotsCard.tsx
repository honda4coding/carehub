import { useEffect, useMemo, useState } from "react";
import { LuClock, LuRefreshCw, LuCalendarDays, LuTrash2, LuChevronDown } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import {
  generateSlots,
  deleteSlot,
  getAvailableSlots,
  Slot,
} from "@/services/appointmentService";
import { formatFullDate, groupSlotsByDate, slotTimeRangeLabel } from "@/components/appointments/format";
import DateRangeFilter from "@/components/ui/DateRangeFilter";
import { useTranslations } from "next-intl";

interface GenerateSlotsCardProps {
  clinicId?: string;
  doctorId?: string;
  hasSelectedDays: boolean;
  slotsVersion?: number;
  onToast: (msg: string, variant: "success" | "error") => void;
}

export default function GenerateSlotsCard({
  clinicId,
  doctorId,
  hasSelectedDays,
  onToast,
   slotsVersion,
}: GenerateSlotsCardProps) {
    const t = useTranslations("auto");
  const [generateRange, setGenerateRange] = useState({ startDate: "", endDate: "" });
  const [generating, setGenerating] = useState(false);
  const [mySlots, setMySlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);
  const [openSlotDay, setOpenSlotDay] = useState<string | null>(null);

  async function loadSlots() {
    if (!doctorId) return;
    setSlotsLoading(true);
    try {
      const data = await getAvailableSlots(doctorId, clinicId);
      setMySlots(data);
    } catch (err: any) {
      onToast(err.message || "Failed to load open slots", "error");
    } finally {
      setSlotsLoading(false);
    }
  }

  useEffect(() => {
    if (doctorId) loadSlots();
  }, [doctorId, clinicId, slotsVersion]);

  async function handleGenerate() {
    if (!generateRange.startDate || !generateRange.endDate) {
      onToast("Please pick a start and end date", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateSlots({
        ...(clinicId ? { clinicId } : {}),
        startDate: generateRange.startDate,
        endDate: generateRange.endDate,
      });
      onToast(`Generated ${res.totalSlots ?? res.count ?? "your"} slots successfully`, "success");
      loadSlots();
    } catch (err: any) {
      onToast(err.message || "Failed to generate slots", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    setDeletingSlot(slotId);
    try {
      await deleteSlot(slotId);
      setMySlots((prev) => prev.filter((s) => s._id !== slotId));
      onToast("Slot removed", "success");
    } catch (err: any) {
      onToast(err.message || "Could not delete slot", "error");
    } finally {
      setDeletingSlot(null);
    }
  }

  async function handleDeleteDaySlots(slots: Slot[]) {
    try {
      await Promise.all(slots.map((s) => deleteSlot(s._id)));
      const deletedIds = new Set(slots.map((s) => s._id));
      setMySlots((prev) => prev.filter((s) => !deletedIds.has(s._id)));
      onToast("All slots for this day removed", "success");
    } catch (err: any) {
       await loadSlots();
       onToast(err.message || "Could not delete some slots", "error");
    }
  }

  const slotGroups = useMemo(() => groupSlotsByDate(mySlots), [mySlots]);

  return (
    <div className="space-y-5">
      {/* Generate card */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <LuRefreshCw className="text-[hsl(var(--color-primary))] text-base" />
          <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
            {t('generateSlots')}</p>
        </div>
        <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mb-4">
          {t('pickADateRange')}{clinicId ? " for this clinic" : ""}
        </p>

        <div className="mb-4">
          <DateRangeFilter
            startDate={generateRange.startDate}
            endDate={generateRange.endDate}
            minStartDate={new Date().toISOString().split("T")[0]}
            minEndDate={generateRange.startDate || new Date().toISOString().split("T")[0]}
            onStartDateChange={(val) => setGenerateRange((r) => ({ ...r, startDate: val }))}
            onEndDateChange={(val) => setGenerateRange((r) => ({ ...r, endDate: val }))}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !hasSelectedDays}
          isLoading={generating}
          icon={LuRefreshCw}
          className="w-full !py-3 !h-[44px] !rounded-xl !bg-[hsl(var(--color-primary))] !text-[hsl(var(--color-bg-base))] hover:!bg-[hsl(var(--color-primary-strong))]"
        >
          {t('generateSlots_7xb6')}</Button>

        {!hasSelectedDays && (
          <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] text-center mt-2">
            {t('selectAtLeastOne')}</p>
        )}
      </div>

      {/* Open slots */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LuClock className="text-[hsl(var(--color-primary))] text-base" />
            <p className="text-base font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
              {t('openSlots')}</p>
          </div>
          {!slotsLoading && mySlots.length > 0 && (
            <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-primary">
              {mySlots.length} {t('total')}</span>
          )}
        </div>

        {slotsLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[48px] rounded-xl bg-[hsl(var(--color-border-soft))] animate-pulse" />
            ))}
          </div>
        ) : slotGroups.length === 0 ? (
          <p className="text-base font-semibold text-[hsl(var(--color-text-muted))] text-center py-6">
            {t('noOpenSlotsYet')}</p>
        ) : (
          <div className="space-y-2">
            {slotGroups.map((group) => {
              const isOpen = openSlotDay === group.dateKey;
              return (
                <div key={group.dateKey} className="border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
                  <div className="w-full flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => setOpenSlotDay(isOpen ? null : group.dateKey)}
                      className="flex items-center gap-3 flex-1 text-start hover:bg-[hsl(var(--color-bg-soft))] transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--color-primary)/0.1)] text-primary flex items-center justify-center shrink-0">
                        <LuCalendarDays className="text-base" />
                      </div>
                      <div>
                        <p className="text-base font-black text-[hsl(var(--color-text))]">
                          {formatFullDate(group.dateObj)}
                        </p>
                        <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">
                          {group.slots.length} {t('slot')}{group.slots.length !== 1 ? "s" : ""} {t('available')}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDaySlots(group.slots); }}
                        className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors p-1 cursor-pointer"
                        title={t('deleteAllSlotsFor')}
                      >
                        <LuTrash2 className="text-base" />
                      </button>
                      <LuChevronDown
                        onClick={() => setOpenSlotDay(isOpen ? null : group.dateKey)}
                        className={`text-[hsl(var(--color-text-muted))] text-base transition-transform duration-200 cursor-pointer ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] px-4 py-3">
                      <div className="grid grid-cols-1 gap-2">
                        {group.slots.map((slot) => (
                          <div
                            key={slot._id}
                            className="flex items-center justify-between gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl px-3.5 py-3 hover:border-primary transition-all duration-300"
                          >
                            <div className="flex items-center gap-2">
                              <LuClock className="text-primary text-base" />
                              <span className="text-base font-bold text-[hsl(var(--color-text))]">
                                {slotTimeRangeLabel(slot)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              disabled={deletingSlot === slot._id}
                              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] p-1.5 rounded-md transition-all duration-300 disabled:opacity-40 shrink-0 cursor-pointer"
                              title={t('deleteThisSlot')}
                            >
                              <LuTrash2 className="text-base" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
