"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchClient } from "@/services/fetchClient";
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu";

function SubscriptionSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, updateUser, token, role } = useAuth();
    
    const paymentStatus = searchParams.get('paymentStatus') || searchParams.get('status');
    const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'paid' || paymentStatus === 'success';
    
    const [status, setStatus] = useState(isSuccess ? "Processing your payment..." : "Payment failed or is still pending.");

    useEffect(() => {
        if (!isSuccess) {
            setTimeout(() => {
                router.replace("/doctor/settings/subscription");
            }, 3000);
            return;
        }

        const refreshProfile = async () => {
            try {
                // Fetch the latest profile to get the updated subscription plan and features
                const res = await fetchClient.get('/users/profile');
                if (res.data && token && role) {
                    const updatedUser = { ...user, ...res.data };
                    if (res.data.fullName) {
                        updatedUser.name = res.data.fullName;
                    }
                    
                    // Update AuthContext and LocalStorage WITHOUT redirecting
                    updateUser(updatedUser as any);
                    
                    setStatus("Payment successful! Redirecting to your dashboard...");
                    
                    // Redirect to the actual dashboard page
                    setTimeout(() => {
                        router.replace("/doctor/settings/subscription");
                    }, 2000);
                } else {
                    router.replace("/doctor/settings/subscription");
                }
            } catch (err) {
                console.error("Failed to refresh profile after payment", err);
                router.replace("/doctor/settings/subscription");
            }
        };

        refreshProfile();
    }, [updateUser, router, token, role, user, isSuccess]);

    return (
        <div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))] items-center justify-center p-4">
            <div className="max-w-md w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center shadow-sm">
                {isSuccess ? (
                    <div className="w-20 h-20 bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success-soft))] rounded-full flex items-center justify-center mx-auto mb-6">
                        <LuCircleCheck className="w-10 h-10 text-[hsl(var(--color-success))] animate-bounce" />
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger-soft))] rounded-full flex items-center justify-center mx-auto mb-6">
                        <LuTriangleAlert className="w-10 h-10 text-[hsl(var(--color-danger))] animate-pulse" />
                    </div>
                )}
                <h2 className="text-2xl font-black text-[hsl(var(--color-text))] mb-3">
                    {isSuccess ? "Success!" : "Payment Issue"}
                </h2>
                <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))]">
                    {status}
                </p>
            </div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={<div className="flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))] items-center justify-center p-4"><div className="w-10 h-10 border-4 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div></div>}>
            <SubscriptionSuccessContent />
        </Suspense>
    );
}
