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

// Matches what getAllDoctors actually returns from the backend:
// doctormodel populated with userId → { fullName, email, confirmed }
export interface DoctorListItem {
  _id: string;          // doctor profile ID (NOT the user ID)
  userId: {
    _id: string;        // ← this is what we pass to getAvailableSlots
    fullName: string;
    email: string;
    confirmed: boolean;
  };
  specialization?: string | null;
  experience?: number | null;
  bio?: string | null;
  profilepicture?: { secure_url: string; public_id: string };
}

export interface Slot {
  _id: string;
  doctorId: string;
  startDateTime: string;
  endDateTime: string;
  isBooked: boolean;
  createdAt: string;
}

export function slotDate(slot: Slot): string {
  return new Date(slot.startDateTime).toISOString().split("T")[0];
}

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
  const endISO =
    appt.endDateTime ??
    (typeof appt.slotId === "object" ? (appt.slotId as Slot).endDateTime : null);
  if (endISO && new Date(endISO).getTime() < Date.now()) return "completed";
  return "upcoming";
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * GET /doctor/all
 * Returns confirmed doctors with userId populated.
 * Note: use doctor.userId._id (not doctor._id) when calling getAvailableSlots.
 */
export async function getApprovedDoctors(): Promise<DoctorListItem[]> {
  const res = await fetchClient.get("/doctor/all");
  // backend wraps in { data: [...] }
  return res.data ?? res;
}

/** GET /appointmens/available-slots/:doctorId  (doctorId = userId._id) */
export async function getAvailableSlots(doctorId: string): Promise<Slot[]> {
  const res = await fetchClient.get(
    `${APPOINTMENTS_BASE}/available-slots/${doctorId}`
  );
  return res.data ?? res;
}

/** PATCH /appointmens/availability */
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

/** POST /appointmens/generate-slots */
export async function generateSlots(payload: {
  startDate: string;
  endDate: string;
}): Promise<{ message: string; count: number }> {
  const res = await fetchClient.post(
    `${APPOINTMENTS_BASE}/generate-slots`,
    payload
  );
  return res.data ?? res;
}

/** POST /appointmens/book */
export async function bookAppointment(slotId: string): Promise<Appointment> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/book`, { slotId });
  return res.data ?? res;
}

/** GET /appointmens/my-appointments */
export async function getMyAppointments(): Promise<Appointment[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/my-appointments`);
  return res.data ?? res;
}

/** GET /appointmens/doctor-appointments */
export async function getDoctorAppointments(): Promise<Appointment[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/doctor-appointments`);
  return res.data ?? res;
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
