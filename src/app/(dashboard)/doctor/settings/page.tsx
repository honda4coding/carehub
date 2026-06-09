"use client";

import { LuSettings } from "react-icons/lu";
import UpdatePasswordForm from "@/components/settings/UpdatePasswordForm";

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
      <main className="flex-1 p-4 md:p-6 flex items-start justify-center pt-10">
        <div className="w-full max-w-md bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6">
           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[hsl(var(--color-border-soft))]">
             <div className="w-10 h-10 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center text-primary text-xl">
               <LuSettings />
             </div>
             <div>
               <h2 className="text-[15px] font-black text-[hsl(var(--color-text))]">Account Settings</h2>
               <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5">Change your password here</p>
             </div>
           </div>

          <UpdatePasswordForm />
        </div>
      </main>
    </div>
  );
}
