"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu";

export default function PaymentCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const paymentStatus = searchParams.get('paymentStatus');
    const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'paid' || paymentStatus === 'success';
    
    const [statusText, setStatusText] = useState(
        isSuccess ? "Payment successful! Redirecting..." : "Payment failed or was cancelled."
    );

    useEffect(() => {
        if (!isSuccess) {
            setTimeout(() => {
                router.replace("/patient/appointments");
            }, 3000);
            return;
        }

        setTimeout(() => {
            router.replace("/patient/appointments");
        }, 3000);
    }, [router, isSuccess]);

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
                    {statusText}
                </p>
            </div>
        </div>
    );
}
