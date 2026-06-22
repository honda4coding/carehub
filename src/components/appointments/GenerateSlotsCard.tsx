import { useState, useMemo } from "react";
import { LuClock, LuRefreshCw } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { generateSlots, deleteSlot, Slot } from "@/services/appointmentService";
import { formatFullDate, groupSlotsByDate } from "@/components/appointments/format";
import SlotChip from "./SlotChip";

interface GenerateSlotsCardProps {
  hasSelectedDays: boolean;
  onToast: (msg: string, variant: "success" | "error") => void;
}

export default function GenerateSlotsCard({ hasSelectedDays, onToast }: GenerateSlotsCardProps) {
  const [generateRange, setGenerateRange] = useState({ startDate: "", endDate: "" });
  const [generating, setGenerating] = useState(false);
  const [generatedSlots, setGeneratedSlots] = useState<Slot[]>([]);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  async function handleGenerate() {
    if (!generateRange.startDate || !generateRange.endDate) {
      onToast("Please pick a start and end date", "error");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateSlots(generateRange);
      // Wait, we need to show the generated slots. generateSlots returns a count but we also need the actual slots.
      // If the backend returns count, where do we get the generatedSlots from?
      // In page.tsx:
      // setGeneratedSlots(...) wasn't being done after generateSlots!
      // Oh wait, looking at page.tsx line 296, the user didn't even set generated slots there! 
      // It just showed a success toast. Let's keep it similar.
      // Wait, there IS a generatedSlots state in page.tsx that was empty. Let's just keep the API call.
      onToast(`Generated ${res.count ?? "your"} slots successfully`, "success");
      // Optionally fetch slots here if we wanted to display them
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
      setGeneratedSlots((prev) => prev.filter((s) => s._id !== slotId));
      onToast("Slot removed", "success");
    } catch (err: any) {
      onToast(err.message || "Could not delete slot", "error");
    } finally {
      setDeletingSlot(null);
    }
  }

  const slotGroups = useMemo(() => groupSlotsByDate(generatedSlots), [generatedSlots]);

  return (
    <div className="space-y-5">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 duration-200">
        <div className="flex items-center gap-2 mb-1">
          <LuRefreshCw className="text-[hsl(var(--color-primary))] text-[14px]" />
          <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
            Generate slots
          </p>
        </div>
        <p className="text-[11.5px] font-semibold text-[hsl(var(--color-text-muted))] mb-4">
          Pick a date range and we'll create all slots from your weekly schedule
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-1.5">
              From
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={generateRange.startDate}
              onChange={(e) =>
                setGenerateRange((r) => ({ ...r, startDate: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[13px] font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[hsl(var(--color-text))] mb-1.5">
              To
            </label>
            <input
              type="date"
              min={generateRange.startDate || new Date().toISOString().split("T")[0]}
              value={generateRange.endDate}
              onChange={(e) =>
                setGenerateRange((r) => ({ ...r, endDate: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[13px] font-bold text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.15)] transition-all cursor-pointer"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !hasSelectedDays}
          isLoading={generating}
          icon={LuRefreshCw}
          className="w-full !py-3 !h-[44px] !rounded-xl !bg-[hsl(var(--color-primary))] !text-[hsl(var(--color-bg-base))] hover:!bg-[hsl(var(--color-primary-strong))]"
        >
          Generate Slots
        </Button>

        {!hasSelectedDays && (
          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] text-center mt-2">
            Select at least one working day first
          </p>
        )}
      </div>

      {/* Generated slots preview */}
      {slotGroups.length > 0 && (
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <LuClock className="text-[hsl(var(--color-primary))] text-[14px]" />
            <p className="text-[13px] font-black uppercase tracking-wide text-[hsl(var(--color-text))]">
              Generated slots
            </p>
          </div>
          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {slotGroups.map((group) => (
              <div key={group.dateKey}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2">
                  {formatFullDate(group.dateObj)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.slots.map((slot) => (
                    <SlotChip
                      key={slot._id}
                      slot={slot}
                      onDelete={handleDeleteSlot}
                      deleting={deletingSlot === slot._id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
