"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { subscriptionService, SubscriptionPlan, DoctorSubscription } from "@/services/subscriptionService";
import { LuCircleCheck, LuCrown, LuBan, LuZap, LuActivity, LuCalendarRange, LuShieldCheck, LuTriangleAlert } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { fetchClient } from "@/services/fetchClient";

export default function DoctorSubscriptionPage() {
    const { user } = useAuth();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [activeSubscription, setActiveSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const [allPlans, currentSub] = await Promise.all([
                    subscriptionService.getPlans(),
                    subscriptionService.getMySubscription()
                ]);
                
                // Sort plans by price
                const sortedPlans = allPlans.sort((a, b) => a.price - b.price);
                setPlans(sortedPlans);
                setActiveSubscription(currentSub);
            } catch (err) {
                console.error("Failed to fetch subscriptions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    const handleUpgrade = async (plan: SubscriptionPlan) => {
        setProcessing(plan._id);
        try {
            const { paymentUrl } = await subscriptionService.checkoutSubscription(plan._id);
            if (paymentUrl) {
                window.location.href = paymentUrl;
            }
        } catch (err) {
            console.error("Failed to checkout", err);
            alert("Payment checkout failed. Please try again.");
            setProcessing(null);
        }
    };

    const handleCancel = async () => {
        if (!activeSubscription) return;
        
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel your subscription? If you have more clinics than the free plan allows, they will be deactivated automatically."
        );
        
        if (!confirmCancel) return;
        
        setProcessing('cancel');
        try {
            await fetchClient.patch(`/doctorsubscriptions/${activeSubscription._id}/cancel`, {
                cancelReason: "User cancelled from dashboard"
            });
            alert("Subscription cancelled successfully.");
            window.location.reload();
        } catch (err) {
            console.error("Failed to cancel", err);
            alert("Failed to cancel subscription.");
            setProcessing(null);
        }
    };

    const isCurrentPlan = (planName: string) => {
        const currentUserPlan = user?.subscriptionPlan || "Free Plan";
        const normalizedUserPlan = currentUserPlan.toLowerCase().trim();
        const normalizedPlanName = planName.toLowerCase().trim();
        
        return normalizedUserPlan === normalizedPlanName || 
               (activeSubscription?.subscriptionId?.name?.toLowerCase().trim() === normalizedPlanName);
    };

    const getPlanIcon = (index: number) => {
        if (index === 0) return <LuActivity className="w-8 h-8 text-[hsl(var(--color-primary))]" />;
        if (index === 1) return <LuZap className="w-8 h-8 text-[hsl(var(--color-warning))]" />;
        return <LuCrown className="w-8 h-8 text-[hsl(var(--color-indigo))]" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))]">
                <DashboardHeader title="Subscriptions" subtitle="Manage your Carehub plan" backPath="/doctor" />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-[hsl(var(--color-text-muted))] font-bold text-sm">Loading plans...</p>
                </div>
            </div>
        );
    }

    const currentPlanName = activeSubscription ? activeSubscription.subscriptionId?.name : "Free Plan";

    return (
        <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))]">
            <DashboardHeader 
                title="Subscriptions" 
                subtitle="Manage your Carehub plan and features" 
                backPath="/doctor" 
            />

            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Active Subscription Banner */}
                    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-[hsl(var(--color-primary-bg))] flex items-center justify-center border border-[hsl(var(--color-primary-soft))]">
                                <LuShieldCheck className="w-7 h-7 text-[hsl(var(--color-primary))]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[hsl(var(--color-text))]">
                                    {currentPlanName}
                                </h2>
                                <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mt-1">
                                    Current active subscription
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                                {activeSubscription && activeSubscription.status === "active" ? (
                                    <div className="flex items-center gap-2 text-[hsl(var(--color-success))] bg-[hsl(var(--color-success-bg))] px-3 py-1.5 rounded-lg border border-[hsl(var(--color-success-soft))]">
                                        <LuCircleCheck className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase">Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-[hsl(var(--color-text-muted))] bg-[hsl(var(--color-bg-soft))] px-3 py-1.5 rounded-lg border border-[hsl(var(--color-border))]">
                                        <span className="text-xs font-black uppercase">Free Tier</span>
                                    </div>
                                )}
                            </div>
                            {activeSubscription?.endDate && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-text-muted))]">
                                    <LuCalendarRange className="w-3.5 h-3.5" />
                                    Renews: {new Date(activeSubscription.endDate).toLocaleDateString()}
                                </div>
                            )}
                            {activeSubscription && activeSubscription.status === "active" && (
                                <button
                                    onClick={handleCancel}
                                    disabled={processing === 'cancel'}
                                    className="text-xs font-bold text-[hsl(var(--color-danger))] hover:underline flex items-center gap-1"
                                >
                                    <LuTriangleAlert className="w-3.5 h-3.5" />
                                    {processing === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-[hsl(var(--color-text))]">Upgrade Your Practice</h2>
                            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-2 font-semibold max-w-xl mx-auto">
                                Choose the perfect plan to expand your clinics, access AI-powered diagnostic tools, and offer premium follow-up care to your patients.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.map((plan, index) => {
                                const isCurrent = isCurrentPlan(plan.name);
                                const isPopular = index === 2; // Highlight Gold plan

                                return (
                                    <div 
                                        key={plan._id} 
                                        className={`relative bg-[hsl(var(--color-bg-surface))] rounded-3xl p-6 flex flex-col shadow-sm transition-all duration-300 ${
                                            isPopular 
                                            ? 'border-2 border-[hsl(var(--color-primary))] transform md:-translate-y-2' 
                                            : 'border border-[hsl(var(--color-border))]'
                                        }`}
                                    >
                                        {isPopular && (
                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <span className="bg-[hsl(var(--color-primary))] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-md">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-3 mb-6">
                                            {getPlanIcon(index)}
                                            <h3 className="text-xl font-black text-[hsl(var(--color-text))]">{plan.name}</h3>
                                        </div>

                                        <div className="mb-6 pb-6 border-b border-[hsl(var(--color-border))]">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-[28px] font-black tracking-tight text-[hsl(var(--color-text))]">
                                                    {plan.price === 0 ? "Free" : `EGP ${plan.price}`}
                                                </span>
                                                {plan.price > 0 && (
                                                    <span className="text-sm font-bold text-[hsl(var(--color-text-muted))] mt-1">
                                                        / mo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mt-2 h-10">
                                                {plan.price === 0 
                                                    ? "Essential tools for starting your digital practice." 
                                                    : "Advanced features and AI support for growing clinics."}
                                            </p>
                                        </div>

                                        <ul className="flex-1 space-y-4 mb-8">
                                            {plan.limits?.map((limit, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <LuCircleCheck className="w-5 h-5 text-[hsl(var(--color-success))] shrink-0" />
                                                    <span className="text-sm font-semibold text-[hsl(var(--color-text))]">
                                                        {limit.value === -1 ? "Unlimited" : limit.value} {limit.code === "maxClinics" ? "Clinics" : limit.code}
                                                    </span>
                                                </li>
                                            ))}
                                            
                                            {plan.features?.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 opacity-90">
                                                    {feature.enabled ? (
                                                        <LuCircleCheck className="w-5 h-5 text-[hsl(var(--color-success))] shrink-0" />
                                                    ) : (
                                                        <LuBan className="w-5 h-5 text-[hsl(var(--color-text-muted))] shrink-0 opacity-50" />
                                                    )}
                                                    <span className={`text-sm font-semibold ${feature.enabled ? 'text-[hsl(var(--color-text))]' : 'text-[hsl(var(--color-text-muted))] opacity-50'}`}>
                                                        {feature.name || feature.code}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={isCurrent || (processing !== null && processing !== plan._id) || plan.price === 0}
                                            className={`w-full py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2 ${
                                                isCurrent
                                                ? 'bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] cursor-not-allowed'
                                                : isPopular
                                                    ? 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-strong))]'
                                                    : plan.price === 0
                                                        ? 'bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] cursor-not-allowed'
                                                        : 'bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-surface))] hover:border-[hsl(var(--color-text-muted))]'
                                            }`}
                                        >
                                            {processing === plan._id ? "Processing..." : isCurrent ? "Current Plan" : plan.price === 0 ? "Current Plan" : "Upgrade"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
