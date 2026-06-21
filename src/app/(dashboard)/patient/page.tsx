"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { HealthHubProfile, TimelineEntry } from "@/types/patient";
import { useAuth } from "@/context/AuthContext";

import Toast from "@/components/patients/Toast";
import PatientHeader from "@/components/patients/PatientHeader";
import ProfileOverview from "@/components/patients/ProfileOverview";
import MedicalAlerts from "@/components/patients/MedicalAlerts";
import MedicalTimeline from "@/components/patients/MedicalTimeline";
import TrackerBanner from "@/components/patients/TrackerBanner";
import QuickActions from "@/components/patients/QuickActions";
import ProfileSkeleton from "@/components/patients/skeletons/ProfileSkeleton";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthHubProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const showToast = useCallback((msg: string) => setToastMsg(msg), []);

  useEffect(() => {
    if (!user) return;
    const patientId = (user as any)._id ?? user.id;

    async function fetchAll() {
      // 1. Fetch profile
      try {
        const { data } = await axios.get(`${BASE_URL}/patient/profile`, {
          headers: authHeaders(),
        });
        const p = data.data ?? data;

        setProfile({
          fullName:         p.fullName ?? p.userName ?? user!.name ?? "Unknown",
          nationalIdStatus: p.nationalIdStatus ?? (p.confirmed ? "Verified" : "Pending"),
          bloodType:        p.bloodType ?? "—",
          chronicDiseases:  p.chronic ?? p.chronicDiseases ?? [],
          allergies:        p.allergies ?? [],
          age:              p.age ?? 0,
          gender:           p.gender === "female" ? "Female" : p.gender === "male" ? "Male" : "Male",
          address:          p.address ?? "—",
          phoneNumber:      p.phoneNumber ?? p.phone ?? p.phone ?? "—",
          height:           p.height ? Number(p.height) : undefined,
          weight:           p.weight ? Number(p.weight) : undefined,
          surgeries:        (p.surgeries ?? []).map((s: any) => typeof s === 'string' ? s : s.operationName || ""),
          profilepicture:   p.profilepicture?.secure_url,
        });
      } catch {
        setProfile({
          fullName:         user!.name ?? "Unknown",
          nationalIdStatus: "Pending",
          bloodType:        "—",
          chronicDiseases:  [],
          allergies:        [],
          age:              0,
          gender:           "Male",
          address:          "—",
          phoneNumber:      "—",
        });
      } finally {
        setProfileLoading(false);
      }

      // 2. Fetch timeline
      try {
        const { data } = await axios.get(`${BASE_URL}/medical-history/${patientId}`, {
          headers: authHeaders(),
        });

        const entries: TimelineEntry[] = [];
        const records = data?.data ?? data ?? [];
        const arr = Array.isArray(records) ? records : records._id ? [records] : [];
        
        arr.forEach((r: any) => {
          entries.push({
            id: `med-${r._id}`,
            rawDate: new Date(r.createdAt ?? r.date ?? Date.now()),
            date: formatDate(r.createdAt ?? r.date),
            doctorName:
              r.doctorId?.fullName ?? r.doctorId?.userName ?? "Doctor",
            specialty:
              r.specialty ?? r.doctorId?.specialization ?? "General",
            chiefComplaint: r.chiefComplaint ?? r.complaint ?? "—",
            diagnosis: r.diagnosis ?? "—",
            clinicalNotes: r.clinicalNotes ?? r.notes ?? "—",
            prescriptions: (r.prescriptions ?? []).map((p: any) => ({
              medication: p.medication ?? p.name ?? "—",
              dosage: p.dosage ?? "—",
              frequency: p.frequency ?? "—",
            })),
            rawRecord: r,
          });
        });

        setTimeline(entries.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()));
      } catch (err: any) {
        showToast(err?.response?.data?.message ?? "Failed to load timeline");
      } finally {
        setTimelineLoading(false);
      }
    }

    fetchAll();
  }, [user, showToast]);

  const filteredTimeline = timeline.filter((e) =>
    e.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <PatientHeader
        fullName={profile?.fullName ?? user?.name ?? "..."}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {profileLoading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <ProfileOverview profile={profile} />
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-[13px] text-red-600 font-bold mb-6 shadow-sm">
            Could not load profile data.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex flex-col">
            <TrackerBanner />
            <MedicalTimeline entries={filteredTimeline} loading={timelineLoading} searchTerm={searchTerm} />
          </div>
          
          <div className="flex flex-col gap-6">
            {!profileLoading && profile && (
              <MedicalAlerts 
                allergies={profile.allergies ?? []} 
                chronicDiseases={profile.chronicDiseases ?? []} 
              />
            )}
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
