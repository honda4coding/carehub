"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/global/DashboardHeader";
import { appConfigService, AppConfig } from "@/services/appConfigService";
import toast from "react-hot-toast";

export default function FinanceSettingsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await appConfigService.getConfig();
      setConfig(data);
      setCommissionRates(data.commissionRates || { free: 10, silver: 8, gold: 5, premium: 2 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (plan: string, val: string) => {
    setCommissionRates(prev => ({
      ...prev,
      [plan]: Number(val)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await appConfigService.updateConfig({ commissionRates });
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500 font-bold">Loading Settings...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#f8fafc] overflow-y-auto">
      <DashboardHeader title="Finance Settings" subtitle="Configure commission rates and fees" />
      
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-[18px] font-black text-slate-800 mb-2">Doctor Commission Rates (%)</h2>
          <p className="text-[14px] text-slate-500 mb-6 font-medium">
            Set the percentage deducted from online appointments based on the doctor's subscription plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(commissionRates).map(plan => (
              <div key={plan}>
                <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {plan} Plan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRates[plan]}
                    onChange={(e) => handleRateChange(plan, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
