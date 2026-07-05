import React, { useEffect, useState } from "react";
import { appConfigService, AppConfig } from "@/services/appConfigService";
import toast from "react-hot-toast";

export default function CommissionSettingsForm() {
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
    return <div className="p-8 text-[hsl(var(--color-text-muted))] font-bold">Loading Settings...</div>;
  }

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm p-6">
      <h2 className="text-[18px] font-black text-[hsl(var(--color-text))] mb-2">Doctor Commission Rates (%)</h2>
      <p className="text-[14px] text-[hsl(var(--color-text-muted))] mb-6 font-medium">
        Set the percentage deducted from online appointments based on the doctor's subscription plan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(commissionRates).map(plan => (
          <div key={plan}>
            <label className="block text-[13px] font-bold text-[hsl(var(--color-text))] uppercase tracking-wider mb-2">
              {plan} Plan
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={commissionRates[plan]}
                onChange={(e) => handleRateChange(plan, e.target.value)}
                className="w-full px-4 py-3 bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold text-[hsl(var(--color-text))]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))] font-bold">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[hsl(var(--color-primary))] text-[hsl(var(--color-text-inverse))] font-bold rounded-xl hover:bg-[hsl(var(--color-primary-strong))] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
