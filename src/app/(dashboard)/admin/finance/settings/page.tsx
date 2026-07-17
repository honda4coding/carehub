"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import CommissionSettingsForm from "@/components/admin/finance/CommissionSettingsForm";
import { LuRefreshCw } from "react-icons/lu";

export default function FinanceSettingsPage() {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg))] overflow-y-auto">
      <DashboardHeader 
        title="Finance Settings" 
        subtitle="Configure commission rates and fees"
        rightElement={
          <button
            onClick={() => window.location.reload()}
            title="Refresh"
            className="w-[33px] h-[33px] rounded-[9px] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-primary))] hover:text-white transition-all cursor-pointer"
          >
            <LuRefreshCw className="text-[14px]" />
          </button>
        }
      />
      
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        <CommissionSettingsForm />
      </div>
    </div>
  );
}
