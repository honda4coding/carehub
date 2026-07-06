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
  userId: { _id: string; fullName: string; email: string; confirmed: boolean; phone?: string; phoneNumber?: string; profilepicture?: { secure_url: string; public_id: string } };
  specialization?: string | null;
  experience?: number | null;
  bio?: string | null;
  profilepicture?: { secure_url: string; public_id: string };
  certificates?: Array<{
    _id: string;
    title: string;
    issuer: string;
    issueDate?: string;
    secure_url: string;
  }>;
  consultationFee?: number;
  followUpFee?: number;
}

// ── CHANGED: أضفنا clinicId populated ────────────────────────────────────────
export interface Slot {
  _id: string;
  doctorId: string;
  clinicId?: { _id: string; name: string; address: string; governorate: string; phone?: string; whatsapp?: string } | null;
  startDateTime: string;
  endDateTime: string;
  isBooked: boolean;
  isReserved?: boolean;
  reservedAt?: string;
  reservedBy?: string;
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
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  isFollowUp?: boolean;
  isFollowUpAction?: boolean;
  followUpDeadline?: string;
  createdAt: string;
  amount?: number;
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

export interface MyAppointment {
  _id: string;
  status: "booked" | "cancelled" | "completed";
  startDateTime: string;
  endDateTime: string;
  appointmentDate: string;
  doctorId: { _id?: string; fullName: string; email: string; profilepicture?: { secure_url: string }; phoneNumber?: string };
  clinicId?: { name: string; address: string; governorate: string; phone?: string; whatsapp?: string; landline?: string } | null;
  isFollowUp?: boolean;
  followUpStatus?: "none" | "scheduled" | "used" | "expired" | "overridden";
  followUpDeadline?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getApprovedDoctors(): Promise<DoctorListItem[]> {
  const res = await fetchClient.get("/doctor/all");
  return res.data ?? res;
}

export async function getAvailableSlots(
  doctorId: string, 
  clinicIdOrOptions?: string | { clinicId?: string, startDate?: string, endDate?: string, includeBooked?: string | boolean, limit?: number }, 
  legacyIncludeBooked?: boolean
): Promise<Slot[]> {
  let params: any = { cb: Date.now().toString() };
  
  if (typeof clinicIdOrOptions === 'string') {
    params.clinicId = clinicIdOrOptions;
    if (legacyIncludeBooked) params.includeBooked = 'true';
  } else if (clinicIdOrOptions && typeof clinicIdOrOptions === 'object') {
    if (clinicIdOrOptions.clinicId) params.clinicId = clinicIdOrOptions.clinicId;
    if (clinicIdOrOptions.startDate) params.startDate = clinicIdOrOptions.startDate;
    if (clinicIdOrOptions.endDate) params.endDate = clinicIdOrOptions.endDate;
    if (clinicIdOrOptions.includeBooked) params.includeBooked = 'true';
    if (clinicIdOrOptions.limit) params.limit = clinicIdOrOptions.limit;
  }

  const res = await fetchClient.get(
    `${APPOINTMENTS_BASE}/available-slots/${doctorId}`,
    { params }
  );
  return res.data ?? res;
}

export async function deleteDoctorSlot(slotId: string): Promise<void> {
  const res = await fetchClient.delete(`${APPOINTMENTS_BASE}/slots/${slotId}`);
  return res.data ?? res;
}

export async function deleteMultipleDoctorSlots(slotIds: string[]): Promise<void> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/slots/delete-multiple`, { slotIds });
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
    force: boolean;
  }>
): Promise<Availability> {
  const res = await fetchClient.patch(
    `${APPOINTMENTS_BASE}/availability/${availabilityId}`,
    payload
  );
  return res.data ?? res;
}

export async function getClinicAvailability(clinicId: string): Promise<Availability[]> {
  const res = await fetchClient.get(`${APPOINTMENTS_BASE}/availability`, { params: { clinicId } });
  return res.data ?? res;
}

export async function deleteAvailability(availabilityId: string, force?: boolean): Promise<void> {
  const url = force ? `${APPOINTMENTS_BASE}/availability/${availabilityId}?force=true` : `${APPOINTMENTS_BASE}/availability/${availabilityId}`;
  await fetchClient.request(url, { method: "DELETE" });
}

export async function generateSlots(payload: {
  clinicId?: string;
  dates: string[];
  force?: boolean;
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

export async function releaseReservation(slotId: string): Promise<void> {
  await fetchClient.post(`${APPOINTMENTS_BASE}/release-reservation`, { slotId });
}

export async function holdSlot(slotId: string): Promise<void> {
  await fetchClient.post(`${APPOINTMENTS_BASE}/hold`, { slotId });
}

export async function confirmAppointment(slotId: string, paymentId: string, reason?: string): Promise<Appointment> {
  const res = await fetchClient.post(`${APPOINTMENTS_BASE}/confirm`, {
    slotId,
    paymentId,
    ...(reason && { reason }),
  });
  return res.data ?? res;
}