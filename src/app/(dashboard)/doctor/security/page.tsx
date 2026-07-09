"use client";

import DashboardHeader from "@/components/global/DashboardHeader";
import UpdatePasswordForm from "@/components/settings/UpdatePasswordForm";

export default function DoctorSecurityPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <DashboardHeader
        title="Security"
        subtitle="Update your password and account security"
        showBack={true}
      />
      <main className="flex-1 p-6 flex justify-center items-start pt-12">
        <UpdatePasswordForm />
      </main>
    </div>
  );
}
