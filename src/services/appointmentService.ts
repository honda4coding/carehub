import { fetchClient } from "./fetchClient";

const APPOINTMENTS_BASE = "/appointmens";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BasicProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilepicture?: { secure_url: string; public_id: string };
}

export interface DoctorListItem {
  _id: string;
  fullName: string;
  email: string;
  profilepicture?: { secure_url: string; public_id: string };
  specialization?: string | null;
  experience?: number | null;
  bio?: string | null;
}

// Backend stores startDateTime & endDateTime as full ISO timestamps
export interface Slot {
  _id: string;
  doctorId: string;
  startDateTime: string; // full ISO e.g. "2025-06-20T09:00:00.000Z"
  endDateTime: string;   // full ISO
  isBooked: boolean;
  createdAt: string;
}

// ─── Slot helpers ──────────────────────────────────────────────────────────────

/** Extract "YYYY-MM-DD" from a slot's startDateTime */
export function slotDate(slot: Slot): string {
  return new Date(slot.startDateTime).toISOString().split("T")[0];
}

/** Extract "HH:MM" (local) from an ISO timestamp */
export function slotTime(isoString: string): string {
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export type AppointmentStatus = "booked" | "completed" | "cancelled";

export interface Appointment {
  _id: string;
  patientId: BasicProfile | string;
  doctorId: BasicProfile | string;
  slotId: Slot | string;
  appointmentDate: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export type DisplayStatus = "upcoming" | "completed" | "cancelled";

export function getDisplayStatus(appt: Appointment): DisplayStatus {
  if (appt.status === "cancelled") return "cancelled";
  if (appt.status === "completed") return "completed";

  // Use the appointment's own endDateTime first, fallback to slotId
  const endISO =
    appt.endDateTime ??
    (typeof appt.slotId === "object" ? (appt.slotId as Slot).endDateTime : null);

  if (endISO && new Date(endISO).getTime() < Date.now()) return "completed";
  return "upcoming";
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** GET /patient/doctors */
export async function getApprovedDoctors(): Promise<DoctorListItem[]> {
  const res = await fetchClient.get("/patient/doctors");
  return res.data;
}

/**
 * POST /appointmens/generate-slots
 * Doctor generates slots for a date range.
 * The backend uses the doctor's saved availability (days + times) to create slots.
 */
export async function generateSlots(payload: {
  startDate: string;
  endDate: string;
}): Promise<{ message: string; count: number }> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/generate-slots`, payload);
  return res.data;
}

/**
 * PATCH /appointmens/availability
 * Doctor sets their weekly availability template (day + time range + duration).
 */
export async function setAvailability(payload: {
  day: string;
  startTime: string;
  endTime: string;
  appointmentDuration: number;
}): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/availability`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** GET /appointmens/available-slots/:doctorId — for patients browsing a doctor's slots */
export async function getAvailableSlots(doctorId: string): Promise<Slot[]> {
  const res = await fetchClient.get(
    `${APPOINTMENTS_BASE}/available-slots/${doctorId}`
  );
  return res.data;
}

/** GET /appointmens/doctor/upcoming — doctor's own slots (unbooked, future) */
export async function getDoctorUpcomingSlots(): Promise<Slot[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/doctor/upcoming`);
  return res.data;
}

/** POST /appointmens/book — patient books a slot */
export async function bookAppointment(slotId: string): Promise<Appointment> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/book`, { slotId });
  return res.data;
}

/** GET /appointmens/my-appointments — patient's own appointments */
export async function getMyAppointments(): Promise<Appointment[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/my-appointments`);
  return res.data;
}

/** GET /appointmens/doctor-appointments — doctor's booked appointments */
export async function getDoctorAppointments(): Promise<Appointment[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/doctor-appointments`);
  return res.data;
}

/** PATCH /appointmens/cancel/:appointmentId */
export async function cancelAppointment(appointmentId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/cancel/${appointmentId}`, {
    method: "PATCH",
  });
}

/** PATCH /appointmens/complete/:appointmentId */
export async function completeAppointment(appointmentId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/complete/${appointmentId}`, {
    method: "PATCH",
  });
}

/** DELETE /appointmens/slot/:slotId */
export async function deleteSlot(slotId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/slot/${slotId}`, {
    method: "DELETE",
  });
}
