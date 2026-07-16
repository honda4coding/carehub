"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchClient } from "@/services/fetchClient";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LuPlus, LuTrash2, LuUserX, LuShieldCheck, LuPencil } from "react-icons/lu";
import Link from "next/link";
import { useClinicContext } from "@/context/ClinicContext";
import ClinicSelector from "@/components/doctor/ClinicSelector";

export default function StaffManagementPage() {
    const { user } = useAuth();
    const { activeClinicId } = useClinicContext();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    const [clinics, setClinics] = useState<any[]>([]);

    // Form state
    const defaultFormData = {
        fullName: "", email: "", password: "", phoneNumber: "", clinicId: "", jobTitle: "", isActive: true,
        permissions: { canManageAppointments: false, canManagePatientsVitals: false, canManagePatientsFull: false, canManageBilling: false, canManageReports: false, canManageClinics: false }
    };
    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clinicsRes = await fetchClient.get("/clinics");
                const fetchedClinics = clinicsRes.data?.clinics || clinicsRes.data || [];
                setClinics(fetchedClinics);

                if (activeClinicId) {
                    const staffRes = await fetchClient.get("/doctor/staff");
                    setStaff(staffRes.data || []);
                } else if (fetchedClinics.length === 0) {
                    setStaff([]);
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeClinicId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStaffId) {
                const res = await fetchClient.put(`/doctor/staff/${editingStaffId}`, formData);
                setStaff(staff.map(s => s._id === editingStaffId ? res.data : s));
            } else {
                const res = await fetchClient.post("/doctor/staff", formData);
                setStaff([...staff, res.data]);
            }
            setIsModalOpen(false);
            setEditingStaffId(null);
            setFormData(defaultFormData);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to save staff member.");
        }
    };

    const handleEditClick = (member: any) => {
        setFormData({
            fullName: member.userId?.fullName || "",
            email: member.userId?.email || "",
            password: "", // Leave blank on edit unless they want to change it (backend should handle blank as no-change)
            phoneNumber: member.userId?.phoneNumber || "",
            clinicId: member.clinicId?._id || member.clinicId || "",
            jobTitle: member.jobTitle || "",
            isActive: member.isActive ?? true,
            permissions: { ...defaultFormData.permissions, ...(member.permissions || {}) }
        });
        setEditingStaffId(member._id);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setFormData(defaultFormData);
        setEditingStaffId(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await fetchClient.delete(`/doctor/staff/${id}`);
            setStaff(staff.filter(s => s._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader 
                title="Staff Management" 
                subtitle="Manage your clinic assistants and their permissions"
            />

            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[hsl(var(--color-bg-surface))] p-4 sm:p-5 rounded-2xl border border-[hsl(var(--color-border))]">
                        <div>
                            <h2 className="text-[16px] font-black text-[hsl(var(--color-text))]">Team Overview</h2>
                            <p className="text-sm font-medium text-[hsl(var(--color-text-muted))]">View and manage all active team members</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                            <div className="flex items-center h-[38px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-2">
                                <ClinicSelector />
                            </div>
                            <Button variant="secondary" className="w-full sm:w-auto justify-center font-bold h-[38px]" href="/doctor/staff/logs" icon={LuShieldCheck}>
                                Activity Logs
                            </Button>
                            <Button variant="primary" className="w-full sm:w-auto justify-center font-bold shadow-sm h-[38px]" icon={LuPlus} onClick={openAddModal}>
                                Add Staff
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[hsl(var(--color-bg-soft))] rounded-2xl" />)}
                        </div>
                    ) : staff.length === 0 ? (
                        <Card className="p-12 flex flex-col items-center justify-center text-center">
                            <LuUserX className="text-6xl text-[hsl(var(--color-text-muted))] mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2 text-[hsl(var(--color-text))]">No Staff Members Yet</h3>
                            <p className="text-[hsl(var(--color-text-muted))] max-w-sm">Add assistants or secretaries to help manage your clinic operations.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {staff.map((member) => (
                                <Card key={member._id} className="p-5 flex flex-col relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-[hsl(var(--color-text))]">{member.userId?.fullName}</h3>
                                            <span className="text-xs font-black uppercase text-[hsl(var(--color-primary))] tracking-wider">{member.jobTitle}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditClick(member)} className="p-2 text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.1)] rounded-lg transition-colors">
                                                <LuPencil />
                                            </button>
                                            <button onClick={() => handleDelete(member._id)} className="p-2 text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-bg))] rounded-lg transition-colors">
                                                <LuTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4 text-sm text-[hsl(var(--color-text-muted))]">
                                        <p>📧 {member.userId?.email}</p>
                                        <p>📱 {member.userId?.phoneNumber}</p>
                                        <p>🏥 {member.clinicId?.name}</p>
                                        <p className="flex items-center gap-1 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${member.isActive !== false ? "bg-[hsl(var(--color-success))]" : "bg-[hsl(var(--color-danger))]"}`}></span>
                                            {member.isActive !== false ? "Active" : "Suspended"}
                                        </p>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-[hsl(var(--color-border))] flex flex-wrap gap-1">
                                        {Object.entries(member.permissions || {})
                                            .filter(([_, val]) => val)
                                            .map(([key]) => (
                                                <span key={key} className="px-2 py-1 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] text-[10px] font-bold rounded-md">
                                                    {key.replace('canManage', '')}
                                                </span>
                                            ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal - Basic Implementation */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black mb-4 text-[hsl(var(--color-text))]">
                            {editingStaffId ? "Edit Staff" : "Add New Staff"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <input required={!editingStaffId} placeholder="Full Name" value={formData.fullName} className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] disabled:opacity-50" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                                <input required={!editingStaffId} disabled={!!editingStaffId} type="email" placeholder="Email" value={formData.email} className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] disabled:opacity-50" onChange={e => setFormData({...formData, email: e.target.value})} />
                                <input required={!editingStaffId} type="password" placeholder={editingStaffId ? "New Password (leave blank to keep current)" : "Password"} value={formData.password} className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, password: e.target.value})} />
                                <input required={!editingStaffId} placeholder="Phone Number" value={formData.phoneNumber} className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] disabled:opacity-50" onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                                <input required placeholder="Job Title (e.g. Secretary)" value={formData.jobTitle} className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                                
                                <select required value={formData.clinicId} className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, clinicId: e.target.value})}>
                                    <option value="">Select Clinic...</option>
                                    {clinics.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="pt-4 border-t border-[hsl(var(--color-border))]">
                                <h4 className="font-bold text-sm mb-3 text-[hsl(var(--color-text))]">Account Status</h4>
                                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                                    <input type="checkbox" checked={formData.isActive} className="w-5 h-5 rounded border-[hsl(var(--color-border))] text-[hsl(var(--color-success))] focus:ring-[hsl(var(--color-success))]" 
                                        onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                                    />
                                    <span className="text-sm font-semibold text-[hsl(var(--color-text))]">{formData.isActive ? "Active (Can Login)" : "Suspended (Cannot Login)"}</span>
                                </label>

                                <h4 className="font-bold text-sm mb-3 text-[hsl(var(--color-text))]">Permissions</h4>
                                {[
                                    { key: 'Appointments', label: 'Manage Appointments' },
                                    { key: 'PatientsVitals', label: 'Manage Patients (Vitals Only)' },
                                    { key: 'PatientsFull', label: 'Manage Patients (Full Clinical Assessment)' },
                                    { key: 'Billing', label: 'Manage Billing' },
                                    { key: 'Reports', label: 'Manage Reports' },
                                    { key: 'Clinics', label: 'Manage Clinics & Services' }
                                ].map(perm => (
                                    <label key={perm.key} className="flex items-center gap-3 mb-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.permissions[`canManage${perm.key}` as keyof typeof formData.permissions]} className="w-5 h-5 rounded border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]" 
                                            onChange={e => setFormData({...formData, permissions: {...formData.permissions, [`canManage${perm.key}`]: e.target.checked}})} 
                                        />
                                        <span className="text-sm font-semibold text-[hsl(var(--color-text))]">{perm.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">{editingStaffId ? "Save Changes" : "Add Staff"}</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
