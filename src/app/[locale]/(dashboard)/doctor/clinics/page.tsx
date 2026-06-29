"use client";

import { useEffect, useState } from "react";
import {
  LuBuilding2,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuX,
  LuTriangleAlert,
} from "react-icons/lu";
import DashboardHeader from "@/components/global/DashboardHeader";

import {
  Clinic,
  ClinicPayload,
  egyptianGovernorates,
  getMyClinics,
  addClinic,
  updateClinic,
  deleteClinic,
} from "@/services/clinicService";
import ClinicDetailsPanel from "@/components/clinics/ClinicDetailsPanel";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("doctor.clinics");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [form, setForm] = useState<ClinicPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Clinic | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadClinics(selectFirst = false) {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyClinics();
      setClinics(data);
      if (selectFirst && data.length > 0) setSelectedClinicId(data[0]._id);
    } catch (err: any) {
      setError(err.message || t("messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClinics(true);
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
      setFormError(t("messages.requiredFields"));
      return;
    }
    if (!form.phone?.trim() && !form.whatsapp?.trim() && !form.landline?.trim()) {
      setFormError(t("messages.contactRequired"));
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
        setSelectedClinicId(created._id);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || t("messages.generalError"));
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
      if (selectedClinicId === deleteTarget._id) {
        const remaining = clinics.filter((c) => c._id !== deleteTarget._id);
        setSelectedClinicId(remaining.length > 0 ? remaining[0]._id : null);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || t("messages.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title={t("title")}
        subtitle={t("subtitle")}
        backPath="/doctor"
        rightElement={
          <button
            onClick={openAddModal}
            className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-4 py-2 rounded-xl hover:bg-[hsl(var(--color-primary-strong))] transition-all flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="text-lg" /> {t("addClinic")}
          </button>
        }
      />

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
                className="h-24 rounded-2xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] animate-pulse"
              />
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-[hsl(var(--color-bg-surface))] border border-dashed border-[hsl(var(--color-border))] rounded-2xl">
            <LuBuilding2 className="text-4xl text-[hsl(var(--color-text-muted))] mb-3" />
            <h3 className="text-[15px] font-bold text-[hsl(var(--color-text))]">
              {t("noClinics")}
            </h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mt-1 mb-4">
              {t("addFirstClinic")}
            </p>
            <button
              onClick={openAddModal}
              className="bg-[hsl(var(--color-primary))] text-white text-[12px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <LuPlus /> {t("addClinic")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">
            {/* ── LEFT: Clinics list ── */}
            <aside className="w-full lg:w-64 shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-2 px-1">
                {t("sidebarTitle")}
              </p>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto scrollbar-hide lg:overflow-visible pb-1">
                {clinics.map((clinic) => {
                  const isActive = selectedClinicId === clinic._id;
                  return (
                    <div
                      key={clinic._id}
                      onClick={() => setSelectedClinicId(clinic._id)}
                      className={`group flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all shrink-0 lg:w-full cursor-pointer ${
                        isActive
                          ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] border-[hsl(var(--color-primary))] shadow-[0_2px_8px_hsl(var(--color-primary)/0.3)]"
                          : "bg-[hsl(var(--color-bg-surface))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-primary))]"
                      }`}
                    >
                      <LuBuilding2 className="text-[15px] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold truncate">{clinic.name}</p>
                        <p
                          className={`text-[10.5px] font-medium truncate ${
                            isActive
                              ? "text-white/80"
                              : "text-[hsl(var(--color-text-muted))]"
                          }`}
                        >
                          {clinic.governorate}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(clinic);
                          }}
                          className={`p-1 rounded-md cursor-pointer transition-colors ${
                            isActive
                              ? "text-white/80 hover:text-white"
                              : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))]"
                          }`}
                          title={t("editTooltip")}
                        >
                          <LuPencil className="text-[13px]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(clinic);
                          }}
                          className={`p-1 rounded-md cursor-pointer transition-colors ${
                            isActive
                              ? "text-white/80 hover:text-white"
                              : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))]"
                          }`}
                          title={t("deleteTooltip")}
                        >
                          <LuTrash2 className="text-[13px]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* ── RIGHT: Selected clinic's editable data ── */}
            <div className="flex-1 min-w-0">
              {selectedClinicId ? (
                <ClinicDetailsPanel clinicId={selectedClinicId} />
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-[hsl(var(--color-bg-surface))] border border-dashed border-[hsl(var(--color-border))] rounded-2xl">
                  <LuBuilding2 className="text-3xl text-[hsl(var(--color-text-muted))] mb-2" />
                  <p className="text-[13px] font-semibold text-[hsl(var(--color-text-muted))]">
                    {t("selectClinic")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden p-6">
            <button
              onClick={closeModal}
              className="absolute top-3 end-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <LuX className="text-lg" />
            </button>

            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-4">
              {editingClinic ? t("editClinic") : t("addClinic")}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  {t("clinicNameLabel")}
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  placeholder="Al-Shifa Center"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  {t("addressLabel")}
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                  placeholder="New Damietta"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[hsl(var(--color-text-muted))]">
                  {t("governorateLabel")}
                </label>
                <select
                  value={form.governorate}
                  onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-base))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))]"
                >
                  <option value="">{t("selectGovernorate")}</option>
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
                    {t("phoneLabel")}
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
                    {t("whatsappLabel")}
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
                    {t("landlineLabel")}
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
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-primary))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {saving ? t("saving") : editingClinic ? t("saveChanges") : t("addClinic")}
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
              className="absolute top-3 end-3 text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
            >
              <LuX className="text-lg" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center justify-center mx-auto mb-4">
              <LuTriangleAlert className="text-xl" />
            </div>

            <h3 className="text-[16px] font-black text-[hsl(var(--color-text))] mb-1.5">
              {t("deleteTitle")}
            </h3>
            <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] mb-6 leading-relaxed">
              {t("deleteDesc", { name: deleteTarget.name })}
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--color-border))] text-[13px] font-bold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] transition-colors"
              >
                {t("keepIt")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--color-danger))] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {deleting ? t("deleting") : t("yesDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
