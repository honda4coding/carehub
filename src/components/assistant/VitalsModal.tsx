import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LuX, LuHeartPulse } from 'react-icons/lu';
import { fetchClient } from '@/services/fetchClient';
import { useTranslations } from "next-intl";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onSuccess: () => void;
}

export default function VitalsModal({ isOpen, onClose, patient, onSuccess }: VitalsModalProps) {
    const t = useTranslations("auto");
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    sugarLevel: '',
    temperature: '',
    weight: '',
    height: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!patient || !patient.id) {
        throw new Error("Invalid patient session selected.");
      }

      await fetchClient.patch(`/doctor/session/${patient.id}/vitals`, vitals);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
            <LuHeartPulse className="text-xl" />
            <h2 className="text-xl font-black text-[hsl(var(--color-text))]">{t('recordVitals')}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[hsl(var(--color-bg-soft))]">
            <LuX />
          </button>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))]">
          <p className="text-sm font-bold text-[hsl(var(--color-text))]">{patient.patient}</p>
          <p className="text-xs text-[hsl(var(--color-text-muted))]">{patient.phone}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">{t('bloodPressure_ulls')}</label>
              <input
                type="text"
                placeholder="120/80"
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">{t('heartRate')}</label>
              <input
                type="text"
                placeholder={t('bpm')}
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">{t('sugarLevel_bg1y')}</label>
              <input
                type="text"
                placeholder={t('mgdl')}
                value={vitals.sugarLevel}
                onChange={(e) => setVitals({ ...vitals, sugarLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">{t('temperature')}</label>
              <input
                type="text"
                placeholder={t('cF')}
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">{t('weight')}</label>
              <input
                type="text"
                placeholder={t('kgLbs')}
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1 uppercase tracking-wider">{t('height')}</label>
              <input
                type="text"
                placeholder={t('cm')}
                value={vitals.height}
                onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] focus:border-[hsl(var(--color-primary))] outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-[hsl(var(--color-border-soft))] flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('cancel')}</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Vitals'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
