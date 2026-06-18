"use client";

import UpdatePasswordForm from "@/components/settings/UpdatePasswordForm";

export default function PatientSecurityPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      {/* Page title */}
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-6 py-4">
        <h1 className="text-[16px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Security
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Update your password and account security
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-5">
        <UpdatePasswordForm />
      </main>
    </div>
  );
}