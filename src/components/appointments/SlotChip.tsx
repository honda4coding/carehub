import { LuClock, LuTrash2 } from "react-icons/lu";
import { Slot } from "@/services/appointmentService";
import { slotTimeRangeLabel } from "@/components/appointments/format";

interface SlotChipProps {
  slot: Slot;
  onDelete: (id: string) => void;
  deleting: boolean;
}

export default function SlotChip({ slot, onDelete, deleting }: SlotChipProps) {
  return (
    <div className="group flex items-center justify-between gap-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl px-3.5 py-3 hover:border-[hsl(var(--color-primary))] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-2">
        <LuClock className="text-[hsl(var(--color-primary))] text-[13px]" />
        <span className="text-[12.5px] font-bold text-[hsl(var(--color-text))]">
          {slotTimeRangeLabel(slot)}
        </span>
      </div>
      <button
        onClick={() => onDelete(slot._id)}
        disabled={deleting}
        className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.1)] p-1.5 rounded-md transition-all duration-300 disabled:opacity-40 cursor-pointer"
        title="Delete slot"
      >
        <LuTrash2 className="text-[14px]" />
      </button>
    </div>
  );
}
