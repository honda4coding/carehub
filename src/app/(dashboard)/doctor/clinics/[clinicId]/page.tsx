"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft,
  LuBuilding2,
  LuMapPin,
  LuPhone,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuX,
  LuTriangleAlert,
  LuCircleAlert,
  LuCalendarClock,
} from "react-icons/lu";

import {
  Clinic,
  ClinicService,
  getClinicById,
  addService,
  updateService,
  deleteService,
} from "@/services/clinicService";

const EMPTY_SERVICE = { name: "", price: "" };

export default function ClinicDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicId = params?.clinicId as string;

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // service modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ClinicService | null>(null);
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<ClinicService | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getClinicById(clinicId);
      if (!data) {
        setError("Clinic not found.");
      } else {
        setClinic(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load clinic");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clinicId) load();
  }, [clinicId]);

  function openAddModal() {
    setEditingService(null);
    setForm(EMPTY_SERVICE);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(service: ClinicService) {
    setEditingService(service);
    setForm({ name: service.name, price: String(service.price) });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const priceNum = Number(form.price);
    if (!form.name.trim() || !form.price.trim() || isNaN(priceNum) || priceNum < 0) {
      setFormError("Please enter a valid service name and price.");
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        const updated = await updateService(clinicId, editingService._id, {
          name: form.name.trim(),
          price: priceNum,
        });
        setClinic((prev) =>
          prev
            ? {
                ...prev,
                services: prev.services.map((s) =>
                  s._id === editingService._id ? updated : s
                ),
              }
            : prev
        );
      } else {
        const created = await addService(clinicId, {
          name: form.name.trim(),
          price: priceNum,
        });
        setClinic((prev) =>
          prev ? { ...prev, services: [...prev.services, created] } : prev
        );
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
      await deleteService(clinicId, deleteTarget._id);
      setClinic((prev) =>
        prev
          ? { ...prev, services: prev.services.filter((s) => s._id !== deleteTarget._id) }
          : prev
      );
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))] p-6">
        <div className="h-8 w-48 bg-[hsl(var(--color-bg-surface))] rounded-xl animate-pulse mb-4" />
        <div className="h-32 bg-[hsl(var(--color-bg-surface))] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))] items-center justify-center p-6">
        <LuCircleAlert className="text-4xl text-[hsl(var(--color-danger))] mb-3" />
        <p className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-4">
          {error || "Clinic not found."}
        </p>
        <Link
          href="/doctor/clinics"
          className="text-[13px] font-bold text-[hsl(var(--color-primary))] flex items-center gap-1"
        >
          <LuArrowLeft /> Back to clinics
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
      {/* Header */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-4">
        <button
          onClick={() => router.push("/doctor/clinics")}
          className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] flex items-center gap-1 mb-3 pl-11 md:pl-0 cursor-pointer"
        >
          <LuArrowLeft /> Back to clinics
        </button>
        <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuBuilding2 className="text-[hsl(var(--color-primary))]" /> {clinic.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
          <span className="flex items-center gap-1.5">
            <LuMapPin /> {clinic.address} — {clinic.governorate}
          </span>
          {(clinic.phone || clinic.whatsapp || clinic.landline) && (
            <span className="flex items-center gap-1.5">
              <LuPhone /> {clinic.phone || clinic.whatsapp || clinic.landline}
            </span>
          )}
        </div>
      </header>

      <div className="p-4 md:p-6 flex-1 flex flex-col gap-6">
        {/* Services Section */}
        <section className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-black text-[hsl(var(--color-text))]">
              Services & Pricing
            </h2>
            <button
              onClick={openAddModal}
              className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <LuPlus /> Add Service
            </button>
          </div>

          {clinic.services.length === 0 ? (
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] py-6 text-center">
              No services added yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[hsl(var(--color-border))]">
              {clinic.services.map((service) => (
                <div
                  key={service._id}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-[13px] font-bold text-[hsl(var(--color-text))]">
                    {service.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-black text-[hsl(var(--color-primary))]">
                      {service.price} EGP
                    </span>
                    <button
                      onClick={() => openEditModal(service)}
                      className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] cursor-pointer"
                    >
                      <LuPencil className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(service)}
                      className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] cursor-pointer"
                    >
                      <LuTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Availability Section — placeholder pending backend clinicId support */}
        <section className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-black text-[hsl(var(--color-text))] flex items-center gap-2">
              <LuCalendarClock className="text-[hsl(var(--color-primary))]" /> Availability & Slots
            </h2>
          </div>
          <div className="flex items-start gap-2.5 bg-[hsl(var(--color-warning-bg,var(--color-bg-base)))] border border-dashed border-[hsl(var(--color-border))] rounded-xl p-4">
            <LuTriangleAlert className="text-[hsl(var(--color-text-muted))] mt-0.5 shrink-0" />
            <p className="text-[12.5px] font-medium text-[hsl(var(--color-text-muted))] leading-relaxed">
              Availability and slot generation aren&apos;t linked to a specific clinic on
              the backend yet — they&apos;re still tied directly to the doctor. Once the
              <code className="px-1 mx-1 rounded bg-[hsl(var(--color-bg-surface))] font-mono text-[11px]">
                clinicId
              </code>
              field is added to the Availability/Slots endpoints, this section will host the
              weekly schedule and the &quot;Generate Slots&quot; action for this clinic.
            </p>
          </div>
        </section>
      </div>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-sm overflow-hidden p-6">
            <button
              onClick={() => !saving && setModalOpen(false)}
              className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <LuX className="text-lg" />
            </button>

            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-4">
              {editingService ? "Edit Service" : "Add Service"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Service Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  placeholder="Cardiology Consultation"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Price (EGP) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  placeholder="300"
                />
              </div>

              {formError && (
                <p className="text-[12px] font-semibold text-[hsl(var(--color-danger))]">
                  {formError}
                </p>
              )}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {saving ? "Saving…" : editingService ? "Save Changes" : "Add Service"}
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
              Delete this service?
            </h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-6 leading-relaxed">
              &quot;{deleteTarget.name}&quot; will be removed from this clinic.
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
