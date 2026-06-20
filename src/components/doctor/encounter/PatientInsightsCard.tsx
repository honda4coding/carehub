"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuBrainCircuit, LuLoader, LuAlertCircle } from "react-icons/lu";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function PatientInsightsCard({ patientId }: { patientId: string }) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!patientId) return;

    const fetchInsights = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/ai/patient/${patientId}/insights`, {
          headers: authHeaders(),
        });
        setInsights(res.data?.data?.insights || "لا توجد رؤية متاحة حالياً.");
      } catch (err) {
        console.error("AI Insights Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [patientId]);

  if (error) return null;

  return (
    <div className="bg-gradient-to-br from-[hsl(var(--color-bg-surface))] to-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-primary))/0.3] rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 text-[hsl(var(--color-primary))/0.05]">
        <LuBrainCircuit size={150} />
      </div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary))/0.1] text-[hsl(var(--color-primary))] flex items-center justify-center">
          <LuBrainCircuit size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[hsl(var(--color-text))] text-lg">AI Clinical Insights</h3>
          <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))]">Powered by CareHub AI</p>
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--color-primary))] py-4">
            <LuLoader className="animate-spin" /> جاري تحليل السجل الطبي للمريض...
          </div>
        ) : (
          <div className="text-sm text-[hsl(var(--color-text))] font-medium leading-relaxed whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-[hsl(var(--color-border-soft))]">
            {insights}
          </div>
        )}
      </div>
    </div>
  );
}
