"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/global/DashboardHeader";

export default function AssistantSchedulePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.clinicId) {
      router.replace(`/assistant/clinics/${user.clinicId}`);
    } else if (!isLoading && !user?.clinicId) {
      // Fallback if somehow assistant has no clinic
      router.replace("/assistant/appointments");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg))]">
      <DashboardHeader
        title="Loading Schedule..."
        subtitle="Redirecting to your clinic settings"
        backPath="/assistant/appointments"
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[hsl(var(--color-primary)/0.3)] border-t-[hsl(var(--color-primary))] rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
