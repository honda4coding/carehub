"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/global/DashboardShell";

export default function AssistantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "assistant") {
        router.push(`/${role}`);
      }
    }
  }, [user, role, isLoading, router]);

  if (isLoading || !user || role !== "assistant") {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--color-bg))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[hsl(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[hsl(var(--color-text-muted))]">Loading assistant workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell role="assistant">
      {children}
    </DashboardShell>
  );
}
