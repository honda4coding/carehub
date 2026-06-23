"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuBuilding2,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuPhone,
  LuMapPin,
  LuX,
  LuTriangleAlert,
  LuArrowRight,
} from "react-icons/lu";

import {
  Clinic,
  ClinicPayload,
  egyptianGovernorates,
  getMyClinics,
  addClinic,
  updateClinic,
  deleteClinic,
} from "@/services/clinicService";

// ─── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM: ClinicPayload = {
  name: "",
  address: "",
  governorate: "",
  phone: "",
  whatsapp: "",
  landline: "",
};

export default function DoctorClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [form, setForm] = useState<ClinicPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadClinics() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyClinics();
      setClinics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load clinics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClinics();
  }, []);

  function openAddModal() {
    setEditingClinic(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(clinic: Clinic) {
    setEditingClinic(clinic);
    setForm({
      name: clinic.name,
      address: clinic.address,
      governorate: clinic.governorate,
      phone: clinic.phone || "",
      whatsapp: clinic.whatsapp || "",
      landline: clinic.landline || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.address.trim() || !form.governorate) {
      setFormError("Name, address and governorate are required.");
      return;
    }
    if (!form.phone?.trim() && !form.whatsapp?.trim() && !form.landline?.trim()) {
      setFormError("Please provide at least one contact number.");
      return;
    }

    setSaving(true);
    try {
      const payload: ClinicPayload = {
        name: form.name.trim(),
        address: form.address.trim(),
        governorate: form.governorate,
        phone: form.phone?.trim() || undefined,
        whatsapp: form.whatsapp?.trim() || undefined,
        landline: form.landline?.trim() || undefined,
      };

      if (editingClinic) {
        const updated = await updateClinic(editingClinic._id, payload);
        setClinics((prev) =>
          prev.map((c) => (c._id === editingClinic._id ? updated : c))
        );
      } else {
        const created = await addClinic(payload);
        setClinics((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClinic(deleteTarget._id);
      setClinics((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete clinic");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] pl-11 md:pl-0 flex items-center gap-2">
            <LuBuilding2 className="text-[hsl(var(--color-primary))]" /> My Clinics
          </h1>
          <p className="text-xs font-semibold text-[hsl(var(--color-text-muted))] mt-1 pl-11 md:pl-0">
            Manage your clinic locations, services and availability
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-4 py-2 rounded-xl shadow-[0_4px_12px_hsl(var(--color-primary)/0.3)] hover:scale-[1.02] transition-transform flex items-center gap-2 cursor-pointer"
        >
          <LuPlus className="text-lg" /> Add Clinic
        </button>
      </header>

      <div className="p-4 md:p-6 flex-1">
        {error && (
          <div className="mb-4 bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] text-[13px] font-semibold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] animate-pulse"
              />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-[hsl(var(--color-bg-surface))] border border-dashed border-[hsl(var(--color-border))] rounded-2xl">
            <LuBuilding2 className="text-4xl text-[hsl(var(--color-text-muted))] mb-3" />
            <h3 className="text-[15px] font-bold text-[hsl(var(--color-text))]">
              No clinics yet
            </h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mt-1 mb-4">
              Add your first clinic to start managing services and availability.
            </p>
            <button
              onClick={openAddModal}
              className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <LuPlus /> Add Clinic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((clinic) => (
              <div
                key={clinic._id}
                className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-black text-[hsl(var(--color-text))] leading-snug">
                    {clinic.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))]">
                    {clinic.services?.length || 0} services
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
                  <LuMapPin className="mt-0.5 shrink-0" />
                  <span>
                    {clinic.address} — {clinic.governorate}
                  </span>
                </div>

                {(clinic.phone || clinic.whatsapp || clinic.landline) && (
                  <div className="flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
                    <LuPhone className="shrink-0" />
                    <span>{clinic.phone || clinic.whatsapp || clinic.landline}</span>
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-[hsl(var(--color-border))] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(clinic)}
                      className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] flex items-center gap-1 cursor-pointer"
                    >
                      <LuPencil /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(clinic)}
                      className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] flex items-center gap-1 cursor-pointer"
                    >
                      <LuTrash2 /> Delete
                    </button>
                  </div>
                  <Link
                    href={`/doctor/clinics/${clinic._id}`}
                    className="text-[12px] font-bold text-[hsl(var(--color-primary))] flex items-center gap-1"
                  >
                    Manage <LuArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden p-6">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <LuX className="text-lg" />
            </button>

            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-4">
              {editingClinic ? "Edit Clinic" : "Add Clinic"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Clinic Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  placeholder="مركز الشفاء"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Address *
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  placeholder="دمياط الجديدة"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Governorate *
                </label>
                <select
                  value={form.governorate}
                  onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                >
                  <option value="">Select governorate</option>
                  {egyptianGovernorates.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                    placeholder="010xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                    WhatsApp
                  </label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                    placeholder="010xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                    Landline
                  </label>
                  <input
                    value={form.landline}
                    onChange={(e) => setForm({ ...form, landline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                    placeholder="057xxxxxxx"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-[12px] font-semibold text-[hsl(var(--color-danger))]">
                  {formError}
                </p>
              )}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Saving…" : editingClinic ? "Save Changes" : "Add Clinic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-sm overflow-hidden text-center p-6">
            <button
              onClick={() => !deleting && setDeleteTarget(null)}
              className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <LuX className="text-lg" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center justify-center mx-auto mb-4">
              <LuTriangleAlert className="text-xl" />
            </div>

            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">
              Delete this clinic?
            </h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-6 leading-relaxed">
              &quot;{deleteTarget.name}&quot; will be deactivated. You can&apos;t undo this from here.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                Keep it
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-danger))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
