"use client";

import { useEffect, useState } from "react";
import {
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
  LuCalendarDays,
} from "react-icons/lu";

import {
  Clinic,
  ClinicService,
  getClinicById,
  addService,
  updateService,
  deleteService,
  updateClinic,
} from "@/services/clinicService";
import AppointmentToast from "@/components/appointments/AppointmentToast";
import ScheduleSetup from "@/components/appointments/ScheduleSetup";
import GenerateSlotsModal from "@/components/appointments/GenerateSlotsModal";
import OpenSlotsPanel from "@/components/appointments/OpenSlotsPanel";
import { useAuth } from "@/context/AuthContext";

const EMPTY_SERVICE = { name: "", price: "" };

interface Props {
  clinicId: string;
}

/**
 * Everything you can do with a single clinic: services + availability + slots.
 * Used both as the [clinicId] page and embedded directly inside the
 * /doctor/clinics sidebar layout — pick a clinic on the left, edit it here.
 */
export default function ClinicDetailsPanel({ clinicId }: Props) {
  const { user, role } = useAuth();
  const doctorId = role === 'assistant' 
    ? (user as any)?.doctorId 
    : ((user as any)?._id ?? user?.id ?? "");
  
  console.log("[ClinicDetailsPanel] user:", user);
  console.log("[ClinicDetailsPanel] calculated doctorId:", doctorId);

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  // toast
  const [toast, setToast] = useState<{
    msg: string;
    variant: "success" | "error";
  } | null>(null);

  // schedule state
  const [hasSelectedDays, setHasSelectedDays] = useState(false);

  // service modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ClinicService | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // fees modal
  const [feesModalOpen, setFeesModalOpen] = useState(false);
  const [feesForm, setFeesForm] = useState({ consultationFee: 0, followUpFee: 0 });
  const [feesSaving, setFeesSaving] = useState(false);
  const [feesError, setFeesError] = useState<string | null>(null);

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
        setFeesForm({
          consultationFee: data.consultationFee || 0,
          followUpFee: data.followUpFee || 0,
        });
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
    if (
      !form.name.trim() ||
      !form.price.trim() ||
      isNaN(priceNum) ||
      priceNum < 0
    ) {
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
                  s._id === editingService._id ? updated : s,
                ),
              }
            : prev,
        );
      } else {
        const created = await addService(clinicId, {
          name: form.name.trim(),
          price: priceNum,
        });
        setClinic((prev) =>
          prev ? { ...prev, services: [...prev.services, created] } : prev,
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
          ? {
              ...prev,
              services: prev.services.filter((s) => s._id !== deleteTarget._id),
            }
          : prev,
      );
      setToast({ msg: "Service deleted.", variant: "success" });
    } catch (err: any) {
      setToast({
        msg: err.message || "Failed to delete service.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleSaveFees(e: React.FormEvent) {
    e.preventDefault();
    setFeesError(null);
    setFeesSaving(true);
    try {
      await updateClinic(clinicId, {
        consultationFee: Number(feesForm.consultationFee),
        followUpFee: Number(feesForm.followUpFee),
      });
      await load();
      setFeesModalOpen(false);
      setToast({ msg: "Fees updated successfully.", variant: "success" });
    } catch (err: any) {
      setFeesError(err.message || "Failed to update fees.");
    } finally {
      setFeesSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 bg-[hsl(var(--color-bg-surface))] rounded-xl animate-pulse" />
        <div className="h-32 bg-[hsl(var(--color-bg-surface))] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-[hsl(var(--color-bg-surface))] border border-dashed border-[hsl(var(--color-border))] rounded-2xl">
        <LuCircleAlert className="text-4xl text-[hsl(var(--color-danger))] mb-3" />
        <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">
          {error || "Clinic not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Clinic info header */}
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
        <h1 className="text-lg md:text-xl font-black text-[hsl(var(--color-text))] flex items-center gap-2">
          <LuBuilding2 className="text-[hsl(var(--color-primary))]" />{" "}
          {clinic.name}
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
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Services & Schedule */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Services Section */}
          <section className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-black text-[hsl(var(--color-text))]">
            Services &amp; Pricing
          </h2>
          <button
            onClick={openAddModal}
            className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <LuPlus /> Add Service
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="bg-[hsl(var(--color-primary)/0.1)] px-4 py-3 rounded-xl border border-[hsl(var(--color-primary)/0.2)] flex items-center justify-between min-w-[200px] flex-1">
            <div>
              <span className="block text-[11px] font-bold text-[hsl(var(--color-primary))] uppercase tracking-wider mb-1">Consultation Fee</span>
              <span className="text-[16px] font-black text-[hsl(var(--color-text))]">{clinic.consultationFee} <span className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">EGP</span></span>
            </div>
            <button onClick={() => setFeesModalOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-colors cursor-pointer">
              <LuPencil size={14} />
            </button>
          </div>
          <div className="bg-[hsl(var(--color-primary)/0.1)] px-4 py-3 rounded-xl border border-[hsl(var(--color-primary)/0.2)] flex items-center justify-between min-w-[200px] flex-1">
            <div>
              <span className="block text-[11px] font-bold text-[hsl(var(--color-primary))] uppercase tracking-wider mb-1">Follow-Up Fee</span>
              <span className="text-[16px] font-black text-[hsl(var(--color-text))]">{clinic.followUpFee} <span className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">EGP</span></span>
            </div>
            <button onClick={() => setFeesModalOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-colors cursor-pointer">
              <LuPencil size={14} />
            </button>
          </div>
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

          {/* Weekly Schedule Section */}
          <section className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-6">
              <LuCalendarClock className="text-[hsl(var(--color-primary))] text-xl" />
              <div>
                <h2 className="text-[16px] font-black text-[hsl(var(--color-text))] leading-tight">
                  Weekly Schedule
                </h2>
                <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">
                  Set your recurring availability for this clinic
                </p>
              </div>
            </div>

            <ScheduleSetup
              clinicId={clinicId}
              doctorId={doctorId}
              onToast={(msg, variant) => setToast({ msg, variant })}
              onSelectedDaysChange={setHasSelectedDays}
              onDayDeleted={() => setSlotsVersion((v) => v + 1)}
            />
          </section>
        </div>

        {/* Right Column: Open Slots */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-xl text-[hsl(var(--color-text))]">Open Slots</h2>
            <button 
              onClick={() => setGenerateModalOpen(true)}
              className="bg-[hsl(var(--color-primary))] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
            >
              <LuCalendarDays className="w-4 h-4" />
              Generate Custom Slots
            </button>
          </div>

          <OpenSlotsPanel
            clinicId={clinicId}
            doctorId={doctorId}
            slotsVersion={slotsVersion}
          />
        </div>
      </div>

      <GenerateSlotsModal 
        isOpen={isGenerateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        clinicId={clinicId}
        onSuccess={(totalSlots) => {
          setToast({
            msg: `Generated ${totalSlots} slots successfully.`,
            variant: "success",
          });
          setSlotsVersion((v) => v + 1);
        }}
      />

      {/* Toast */}
      {toast && (
        <AppointmentToast
          message={toast.msg}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

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
                  {saving
                    ? "Saving…"
                    : editingService
                      ? "Save Changes"
                      : "Add Service"}
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

      {/* Edit Fees Modal */}
      {feesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-sm overflow-hidden p-6">
            <button
              onClick={() => !feesSaving && setFeesModalOpen(false)}
              className="absolute top-3 right-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors cursor-pointer"
            >
              <LuX className="text-lg" />
            </button>

            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-4">
              Edit Clinic Fees
            </h3>

            <form onSubmit={handleSaveFees} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Consultation Fee (EGP) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={feesForm.consultationFee}
                  onChange={(e) => setFeesForm({ ...feesForm, consultationFee: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  Follow-Up Fee (EGP) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={feesForm.followUpFee}
                  onChange={(e) => setFeesForm({ ...feesForm, followUpFee: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                />
              </div>

              {feesError && (
                <p className="text-[12px] font-semibold text-[hsl(var(--color-danger))]">
                  {feesError}
                </p>
              )}

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setFeesModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feesSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
                >
                  {feesSaving ? "Saving…" : "Save Fees"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
