"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import CommissionSettingsForm from "@/components/admin/finance/CommissionSettingsForm";

export default function FinanceSettingsPage() {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[hsl(var(--color-bg))] overflow-y-auto">
      <DashboardHeader title="Finance Settings" subtitle="Configure commission rates and fees" />
      
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        <CommissionSettingsForm />
      </div>
    </div>
  );
}
