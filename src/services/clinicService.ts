import { fetchClient } from "./fetchClient";

const CLINICS_BASE = "/clinics";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClinicService {
  _id: string;
  name: string;
  price: number;
}

export interface Clinic {
  _id: string;
  doctorId: string;
  name: string;
  address: string;
  governorate: string;
  phone?: string;
  whatsapp?: string;
  landline?: string;
  services: ClinicService[];
  consultationFee: number;
  followUpFee: number;
  isActive: boolean;
  createdAt: string;
}

export const egyptianGovernorates = [
    "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira",
    "Fayoum", "Gharbia", "Ismailia", "Menofia", "Minya", "Qaliubiya",
    "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena",
    "Sharqia", "South Sinai", "Suez", "Aswan", "Asyut", "Beni Suef",
    "Damietta", "Kafr El Sheikh", "Matruh", "Luxor", "Sohag"
];

export interface ClinicPayload {
  name: string;
  address: string;
  governorate: string;
  phone?: string;
  whatsapp?: string;
  landline?: string;
  consultationFee: number;
  followUpFee: number;
}

export interface ServicePayload {
  name: string;
  price: number;
}

// ─── Clinic CRUD (doctor) ──────────────────────────────────────────────────────

/** GET /clinics — doctor's own clinics */
export interface MyClinicsResponse {
  clinics: Clinic[];
  limitExceeded: boolean;
  maxClinics: number;
}

export async function getMyClinics(): Promise<MyClinicsResponse> {
  const res = await fetchClient.get(CLINICS_BASE);
  
  const payload = res?.data ?? res;
  
  if (Array.isArray(payload)) {
      return { clinics: payload, limitExceeded: false, maxClinics: -1 };
  }
  
  if (payload && Array.isArray(payload.clinics)) {
      return { clinics: payload.clinics, limitExceeded: !!payload.limitExceeded, maxClinics: payload.maxClinics || 1 };
  }
  
  return { clinics: [], limitExceeded: false, maxClinics: 1 };
}

/** POST /clinics */
export async function addClinic(payload: ClinicPayload): Promise<Clinic> {
  const res = await fetchClient.post(CLINICS_BASE, payload);
  return res.data ?? res;
}

/** PATCH /clinics/:clinicId */
export async function updateClinic(
  clinicId: string,
  payload: Partial<ClinicPayload> & { isActive?: boolean }
): Promise<Clinic> {
  const res = await fetchClient.request(`${CLINICS_BASE}/${clinicId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data ?? res;
}

/** DELETE /clinics/:clinicId (soft delete) */
export async function deleteClinic(clinicId: string): Promise<void> {
  await fetchClient.delete(`${CLINICS_BASE}/${clinicId}`);
}

/** Single clinic helper — derived from getMyClinics until a dedicated GET /:id exists */
export async function getClinicById(clinicId: string): Promise<Clinic | undefined> {
  const response = await getMyClinics();
  return response.clinics.find((c) => c._id === clinicId);
}

// ─── Patient side ───────────────────────────────────────────────────────────────

/** GET /clinics/doctor/:doctorId — patient views a doctor's clinics */
export async function getDoctorClinics(
  doctorId: string,
  governorate?: string
): Promise<Clinic[]> {
  const res = await fetchClient.get(`${CLINICS_BASE}/doctor/${doctorId}`, {
    params: governorate ? { governorate } : undefined,
  });
  return res.data ?? res;
}

// ─── Services CRUD (embedded in clinic) ────────────────────────────────────────

/** POST /clinics/:clinicId/services */
export async function addService(
  clinicId: string,
  payload: ServicePayload
): Promise<ClinicService> {
  const res = await fetchClient.post(`${CLINICS_BASE}/${clinicId}/services`, payload);
  return res.data ?? res;
}

/** PATCH /clinics/:clinicId/services/:serviceId */
export async function updateService(
  clinicId: string,
  serviceId: string,
  payload: Partial<ServicePayload>
): Promise<ClinicService> {
  const res = await fetchClient.request(
    `${CLINICS_BASE}/${clinicId}/services/${serviceId}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data ?? res;
}

/** DELETE /clinics/:clinicId/services/:serviceId */
export async function deleteService(clinicId: string, serviceId: string): Promise<void> {
  await fetchClient.delete(`${CLINICS_BASE}/${clinicId}/services/${serviceId}`);
}
