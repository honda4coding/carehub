/** "14:30" -> "2:30 PM" */
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

export function timeRangeLabel(startTime?: string, endTime?: string): string {
  if (!startTime) return "";
  return endTime ? `${to12Hour(startTime)} – ${to12Hour(endTime)}` : to12Hour(startTime);
}

export function initialsOf(name?: string): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function dayLabel(dateInput: string | Date): string {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function formatFullDate(dateInput: string | Date): string {
  return new Date(dateInput).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function isoTo12Hour(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function slotTimeRangeLabel(slot: { startDateTime: string; endDateTime?: string }): string {
  if (!slot?.startDateTime) return "";
  return slot.endDateTime
    ? `${isoTo12Hour(slot.startDateTime)} – ${isoTo12Hour(slot.endDateTime)}`
    : isoTo12Hour(slot.startDateTime);
}

export function groupSlotsByDate<T extends { startDateTime: string }>(
  slots: T[]
): { dateKey: string; dateObj: Date; slots: T[] }[] {
  const map = new Map<string, { dateKey: string; dateObj: Date; slots: T[] }>();
  slots.forEach((s) => {
    const d = new Date(s.startDateTime);
    const key = d.toDateString();
    if (!map.has(key)) {
      map.set(key, { dateKey: key, dateObj: d, slots: [] });
    }
    map.get(key)!.slots.push(s);
  });
  return Array.from(map.values()).sort(
    (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
  );
}

/**
 * "Next available: Tomorrow · 10:00 AM"
 * Used on doctor cards to show earliest available slot.
 */
export function nextAvailableLabel(slots: { startDateTime: string }[]): string | null {
  if (!slots.length) return null;
  const sorted = [...slots].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );
  const first = sorted[0];
  const d = new Date(first.startDateTime);
  const dayOnly = new Date(d);
  dayOnly.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((dayOnly.getTime() - today.getTime()) / 86_400_000);
  const timeLabel = isoTo12Hour(first.startDateTime);
  if (diff === 0) return `Today · ${timeLabel}`;
  if (diff === 1) return `Tomorrow · ${timeLabel}`;
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${timeLabel}`;
}