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
  userId: { _id: string; fullName: string; email: string; confirmed: boolean; phone?: string; phoneNumber?: string };
  specialization?: string | null;
  experience?: number | null;
  bio?: string | null;
  profilepicture?: { secure_url: string; public_id: string };
}

// ── CHANGED: أضفنا clinicId populated ────────────────────────────────────────
export interface Slot {
  _id: string;
  doctorId: string;
  clinicId?: { _id: string; name: string; address: string; governorate: string; phone?: string; whatsapp?: string } | null;
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
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

export type AppointmentStatus = "booked" | "completed" | "cancelled";

// ── CHANGED: أضفنا clinicId في Appointment ───────────────────────────────────
export interface Appointment {
  _id: string;
  patientId: BasicProfile | string;
  doctorId: BasicProfile | string;
  slotId: Slot | string;
  clinicId?: { _id: string; name: string; address: string; governorate: string; phone?: string; whatsapp?: string; landline?: string } | null;
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
  const endISO = appt.endDateTime ?? (typeof appt.slotId === "object" ? (appt.slotId as Slot).endDateTime : null);
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

// ── CHANGED: أضفنا clinicId في MyAppointment ─────────────────────────────────
export interface MyAppointment {
  _id: string;
  status: "booked" | "cancelled" | "completed";
  startDateTime: string;
  endDateTime: string;
  appointmentDate: string;
  doctorId: { _id?: string; fullName: string; email: string; profilepicture?: { secure_url: string }; phoneNumber?: string };
  clinicId?: { name: string; address: string; governorate: string; phone?: string; whatsapp?: string; landline?: string } | null;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getApprovedDoctors(): Promise<DoctorListItem[]> {
  const res = await fetchClient.get("/doctor/all");
  return res.data ?? res;
}

export async function getAvailableSlots(doctorId: string, clinicId?: string): Promise<Slot[]> {
  const res = await fetchClient.get(
    `${APPOINTMENTS_BASE}/available-slots/${doctorId}`,
    clinicId ? { params: { clinicId } } : undefined
  );
  return res.data ?? res;
}

// ── CHANGED: method كان PATCH — الصح POST ────────────────────────────────────
export async function setAvailability(payload: {
  clinicId?: string;
  day: string;
  startTime: string;
  endTime: string;
  appointmentDuration: number;
}): Promise<Availability> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/availability`, payload);
  return res.data ?? res;
}

export async function getMyAvailability(): Promise<Availability[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/availability`);
  return res.data ?? res;
}

// Editing a day must hit this endpoint (not setAvailability) or you end up
// creating a second, overlapping availability for the same day instead of
// changing the existing one.
export async function updateAvailability(
  availabilityId: string,
  payload: Partial<{
    day: string;
    startTime: string;
    endTime: string;
    appointmentDuration: number;
  }>
): Promise<Availability> {
  const res = await fetchClient.request(
    `${APPOINTMENTS_BASE}/availability/${availabilityId}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data ?? res;
}

export async function getClinicAvailability(clinicId: string): Promise<Availability[]> {
  const all = await getMyAvailability();
  return all.filter((a) => (a as any).clinicId === clinicId || (a as any).clinicId?._id === clinicId);
}

export async function deleteAvailability(availabilityId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/availability/${availabilityId}`, { method: "DELETE" });
}

// ── CHANGED: بيقبل clinicId مع startDate/endDate ─────────────────────────────
export async function generateSlots(payload: {
  clinicId?: string;
  startDate: string;
  endDate: string;
}): Promise<{ message: string; totalSlots?: number; count?: number }> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/generate-slots`, payload);
  return res.data ?? res;
}

// ── CHANGED: أضفنا reason optional ───────────────────────────────────────────
export async function bookAppointment(slotId: string, reason?: string): Promise<Appointment> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/book`, {
    slotId,
    ...(reason && { reason }),
  });
  return res.data ?? res;
}

export interface AppointmentsResponse<T> {
  data: T[];
  pagination?: {
    totalPages: number;
    currentPage: number;
    totalRecords: number;
  };
}

export async function getMyAppointments(params?: { page?: number; limit?: number }): Promise<AppointmentsResponse<MyAppointment>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/my-appointments?${query.toString()}`);
  return { data: res.data ?? res, pagination: res.pagination };
}

export async function getDoctorAppointments(params?: { page?: number; limit?: number }): Promise<AppointmentsResponse<Appointment>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/doctor-appointments?${query.toString()}`);
  return { data: res.data ?? res, pagination: res.pagination };
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/cancel/${appointmentId}`, { method: "PATCH" });
}

export async function completeAppointment(appointmentId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/complete/${appointmentId}`, { method: "PATCH" });
}

export async function deleteSlot(slotId: string): Promise<void> {
  await fetchClient.request(`${APPOINTMENTS_BASE}/slot/${slotId}`, { method: "DELETE" });
}