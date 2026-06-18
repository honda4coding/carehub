"use client";

import UpdatePasswordForm from "@/components/settings/UpdatePasswordForm";

export default function AdminSecurityPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-soft))]">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-6 py-4">
        <h1 className="text-[16px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Security
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Update your password and account security
        </p>
      </header>

      <main className="flex-1 p-6">
        <UpdatePasswordForm />
      </main>
    </div>
  );
}