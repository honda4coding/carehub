"use client";

import { LuSettings } from "react-icons/lu";

export default function DoctorSettingsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] px-4 md:px-6 py-3">
        <h1 className="text-[16px] md:text-[18px] font-black text-[hsl(var(--color-text))] pl-11 md:pl-0">
          Settings
        </h1>
        <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))] mt-0.5 pl-11 md:pl-0">
          Manage your account preferences and security
        </p>
      </header>
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-2xl">
            <LuSettings />
          </div>
          <h2 className="text-lg font-black text-[hsl(var(--color-text))] mb-2">Account Settings</h2>
          <p className="text-sm font-medium text-[hsl(var(--color-text-muted))]">
            This page is currently under construction. Soon you will be able to change your password, email, and notification preferences.
          </p>
        </div>
      </main>
    </div>
  );
}
