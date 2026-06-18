import type { Slot } from "@/services/appointmentService";

// ─── Time formatting ───────────────────────────────────────────────────────────

/** "14:30" → "2:30 PM" */
export function to12Hour(time?: string): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const m = Number(mStr ?? 0);
  if (Number.isNaN(h)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Given an ISO timestamp string, returns a "H:MM AM/PM" label (local time).
 * e.g. "2025-06-20T09:00:00.000Z" → "9:00 AM"
 */
export function isoTo12Hour(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Formats a slot's time range using its startDateTime / endDateTime ISO fields.
 * e.g. "9:00 AM – 9:30 AM"
 */
export function slotTimeRangeLabel(slot: Slot): string {
  const start = isoTo12Hour(slot.startDateTime);
  const end = isoTo12Hour(slot.endDateTime);
  return end ? `${start} – ${end}` : start;
}

/** Legacy helper kept for any remaining usages: "HH:MM" pair → range label */
export function timeRangeLabel(startTime?: string, endTime?: string): string {
  if (!startTime) return "";
  return endTime
    ? `${to12Hour(startTime)} – ${to12Hour(endTime)}`
    : to12Hour(startTime);
}

// ─── Date formatting ───────────────────────────────────────────────────────────

/**
 * Returns a human-friendly day label relative to today.
 * Today / Tomorrow / Yesterday / "Monday, Jun 20"
 */
export function dayLabel(dateInput: string | Date): string {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** "Mon, Jun 20" */
export function formatFullDate(dateInput: string | Date): string {
  return new Date(dateInput).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Short date label for calendar strips: { weekday: "Mon", day: 20 }
 */
export function calendarLabel(dateInput: string | Date): { weekday: string; day: number } {
  const d = new Date(dateInput);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: d.getDate(),
  };
}

// ─── Name helpers ──────────────────────────────────────────────────────────────

/** "John Doe" → "JD" */
export function initialsOf(name?: string): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// ─── Slot grouping ─────────────────────────────────────────────────────────────

/**
 * Groups an array of slots by calendar date (local).
 * Returns sorted array of { dateKey, dateObj, slots[] }.
 */
export function groupSlotsByDate(slots: Slot[]): {
  dateKey: string;
  dateObj: Date;
  slots: Slot[];
}[] {
  const map = new Map<string, { dateObj: Date; slots: Slot[] }>();

  for (const slot of slots) {
    const d = new Date(slot.startDateTime);
    const key = d.toDateString(); // "Fri Jun 20 2025"
    if (!map.has(key)) {
      map.set(key, { dateObj: d, slots: [] });
    }
    map.get(key)!.slots.push(slot);
  }

  return Array.from(map.entries())
    .map(([dateKey, { dateObj, slots }]) => ({
      dateKey,
      dateObj,
      slots: slots.sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime()
      ),
    }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
}

/**
 * Returns the earliest available slot across all slots.
 * Used for the "Next available: Tomorrow 10 AM" badge on doctor cards.
 */
export function nextAvailableLabel(slots: Slot[]): string | null {
  if (!slots.length) return null;
  const sorted = [...slots].sort(
    (a, b) =>
      new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );
  const first = sorted[0];
  const d = new Date(first.startDateTime);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  const timeLabel = isoTo12Hour(first.startDateTime);
  if (diff === 0) return `Today · ${timeLabel}`;
  if (diff === 1) return `Tomorrow · ${timeLabel}`;
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${timeLabel}`;
}
