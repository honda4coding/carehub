"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchClient } from "@/services/fetchClient";
import DashboardHeader from "@/components/global/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LuPlus, LuTrash2, LuUserX, LuShieldCheck } from "react-icons/lu";
import Link from "next/link";

export default function StaffManagementPage() {
    const { user } = useAuth();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clinics, setClinics] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        fullName: "", email: "", password: "", phoneNumber: "", clinicId: "", jobTitle: "",
        permissions: { canManageAppointments: false, canManagePatients: false, canManageBilling: false }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [staffRes, clinicsRes] = await Promise.all([
                    fetchClient.get("/doctor/staff"),
                    fetchClient.get("/doctor/clinics")
                ]);
                setStaff(staffRes.data?.data || []);
                setClinics(clinicsRes.data?.data || []);
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchClient.post("/doctor/staff", formData);
            setStaff([...staff, res.data.data]);
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create staff member.");
        }
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
                rightElement={
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" href="/doctor/staff/logs" icon={LuShieldCheck}>
                            Activity Logs
                        </Button>
                        <Button variant="primary" size="sm" icon={LuPlus} onClick={() => setIsModalOpen(true)}>
                            Add Staff
                        </Button>
                    </div>
                }
            />

            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[hsl(var(--color-bg-soft))] rounded-2xl" />)}
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
                                            <button onClick={() => handleDelete(member._id)} className="p-2 text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-bg))] rounded-lg transition-colors">
                                                <LuTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4 text-sm text-[hsl(var(--color-text-muted))]">
                                        <p>📧 {member.userId?.email}</p>
                                        <p>📱 {member.userId?.phoneNumber}</p>
                                        <p>🏥 {member.clinicId?.name}</p>
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
                        <h2 className="text-xl font-black mb-4 text-[hsl(var(--color-text))]">Add New Staff</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <input required placeholder="Full Name" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                                <input required type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, email: e.target.value})} />
                                <input required type="password" placeholder="Password" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, password: e.target.value})} />
                                <input required placeholder="Phone Number" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                                <input required placeholder="Job Title (e.g. Secretary)" className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                                
                                <select required className="w-full p-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))]" onChange={e => setFormData({...formData, clinicId: e.target.value})}>
                                    <option value="">Select Clinic...</option>
                                    {clinics.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="pt-4 border-t border-[hsl(var(--color-border))]">
                                <h4 className="font-bold text-sm mb-3 text-[hsl(var(--color-text))]">Permissions</h4>
                                {['Appointments', 'Patients', 'Billing'].map(perm => (
                                    <label key={perm} className="flex items-center gap-3 mb-2 cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]" 
                                            onChange={e => setFormData({...formData, permissions: {...formData.permissions, [`canManage${perm}`]: e.target.checked}})} 
                                        />
                                        <span className="text-sm font-semibold text-[hsl(var(--color-text))]">Manage {perm}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">Add Staff</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
