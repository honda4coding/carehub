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
  userId: {
    _id: string;
    fullName: string;
    email: string;
    confirmed: boolean;
    phone?: string;
    phoneNumber?: string;
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

export interface Availability {
  _id: string;
  doctorId: string;
  clinicId: string | { _id: string; name: string; address?: string } | null;
  day: string;
  startTime: string;
  endTime: string;
  appointmentDuration: number;
  createdAt: string;
}

export interface MyAppointment {
  _id: string;
  status: "booked" | "cancelled" | "completed";
  startDateTime: string;
  endDateTime: string;
  doctorId: {
    fullName: string;
    email: string;
    profilepicture?: { secure_url: string };
  };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getApprovedDoctors(): Promise<DoctorListItem[]> {
  const res = await fetchClient.get("/doctor/all");
  return res.data ?? res;
}

/** Backend requires clinicId now (every clinic must have its own schedule).
 *  Kept as the 2nd param optional only so older call sites still type-check;
 *  always pass it for the new clinic-scoped flow. */
export async function getAvailableSlots(
  doctorId: string,
  clinicId?: string
): Promise<Slot[]> {
  const res = await fetchClient.get(
    `${APPOINTMENTS_BASE}/available-slots/${doctorId}`,
    clinicId ? { params: { clinicId } } : undefined
  );
  return res.data ?? res;
}

/** Backend's addAvailability/generateMonthlySlots now require clinicId.
 *  Param kept optional here only so legacy (pre-clinics) call sites still
 *  type-check — always pass clinicId for the new clinic-scoped flow. */
export async function setAvailability(payload: {
  clinicId?: string;
  day: string;
  startTime: string;
  endTime: string;
  appointmentDuration: number;
}): Promise<Availability> {
  const res = await fetchClient.request(`${APPOINTMENTS_BASE}/availability`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data ?? res;
}

/** GET /appointmens/availability — returns ALL of the doctor's availability (all clinics).
 *  Filter client-side by clinicId since the backend doesn't support a query filter here. */
export async function getMyAvailability(): Promise<Availability[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/availability`);
  return res.data ?? res;
}

export async function getClinicAvailability(clinicId: string): Promise<Availability[]> {
  const all = await getMyAvailability();
  return all.filter(
    (a) => (a as any).clinicId === clinicId || (a as any).clinicId?._id === clinicId
  );
}

export async function deleteAvailability(availabilityId: string): Promise<void> {
  await fetchClient.request(
    `${APPOINTMENTS_BASE}/availability/${availabilityId}`,
    { method: "DELETE" }
  );
}

export async function generateSlots(payload: {
  clinicId?: string;
  startDate: string;
  endDate: string;
}): Promise<{ message: string; totalSlots?: number; count?: number }> {
  const res = await fetchClient.post(
    `${APPOINTMENTS_BASE}/generate-slots`,
    payload
  );
  return res.data ?? res;
}

export async function bookAppointment(slotId: string): Promise<Appointment> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/book`, { slotId });
  return res.data ?? res;
}

export async function getMyAppointments(): Promise<MyAppointment[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/my-appointments`);
  return res.data ?? res;
}

export async function getDoctorAppointments(): Promise<Appointment[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/doctor-appointments`);
  return res.data ?? res;
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/cancel/${appointmentId}`, {
    method: "PATCH",
  });
}

export async function completeAppointment(appointmentId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/complete/${appointmentId}`, {
    method: "PATCH",
  });
}

export async function deleteSlot(slotId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/slot/${slotId}`, {
    method: "DELETE",
  });
}
