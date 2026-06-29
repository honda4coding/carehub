import { LuBrainCircuit, LuTriangleAlert, LuCircleCheck } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from 'next-intl';

export default function AIIntelligence() {
  const t = useTranslations('landing.AIIntelligence');
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] py-24 lg:py-32 relative overflow-hidden border-y border-[hsl(var(--color-text-muted)/0.1)]">
      {/* Background Glow */}
      <div className="absolute top-0 end-0 w-[800px] h-[800px] bg-linear-to-bl from-[hsl(var(--color-primary)/0.05)] to-transparent blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 start-0 w-[600px] h-[600px] bg-linear-to-tr from-[hsl(var(--color-secondary)/0.05)] to-transparent blur-[80px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Text */}
        <div>
          <Badge variant="primary" className="mb-6 gap-2">
            <LuBrainCircuit className="w-4 h-4" />
            <span>{t('badge')}</span>
          </Badge>
          
          <h2 className="text-2xl lg:text-4xl font-black text-[hsl(var(--color-text))] tracking-tight mb-6">
            {t('title')}
          </h2>
          
          <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed mb-10 max-w-xl">
            {t('description')}
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <LuCircleCheck className="w-6 h-6 text-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <h4 className="text-[hsl(var(--color-text))] font-bold text-lg mb-1">{t('point1Title')}</h4>
                <p className="text-[hsl(var(--color-text-muted))] text-sm leading-relaxed">{t('point1Desc')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <LuCircleCheck className="w-6 h-6 text-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <h4 className="text-[hsl(var(--color-text))] font-bold text-lg mb-1">{t('point2Title')}</h4>
                <p className="text-[hsl(var(--color-text-muted))] text-sm leading-relaxed">{t('point2Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual: Mock AI Interface */}
        <div className="relative">
          {/* Subtle glow behind the card */}
          <div className="absolute inset-0 bg-[hsl(var(--color-danger))] rounded-3xl blur-3xl opacity-20 animate-pulse" />
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-3xl p-6 lg:p-8 relative z-10">
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[hsl(var(--color-text-muted)/0.1)]">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
                </div>
                <span className="text-danger font-black tracking-widest text-xs uppercase">{t('alertBadge')}</span>
              </div>
              <span className="text-[hsl(var(--color-text-muted))] font-mono text-xs font-bold">{t('aiConfidence')}</span>
            </div>

            <div className="space-y-4">
               {/* Mock Rx Input */}
               <div className="bg-[hsl(var(--color-bg))] rounded-xl p-4 border border-[hsl(var(--color-text-muted)/0.1)]">
                  <span className="text-xs text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-wider mb-2 block">{t('newPrescription')}</span>
                  <div className="text-[hsl(var(--color-text))] font-mono font-bold text-sm">{t('sildenafil50mg')}</div>
               </div>

               {/* Interaction Path */}
               <div className="flex justify-center py-2">
                 <div className="w-px h-8 bg-linear-to-b from-transparent via-red-500/50 to-transparent" />
               </div>

               {/* Mock Patient History Conflict */}
               <div className="bg-[hsl(var(--color-danger)/0.15)] rounded-xl p-4 border border-[hsl(var(--color-danger)/0.4)] shadow-lg shadow-[hsl(var(--color-danger)/0.1)]">
                  <div className="flex items-start gap-3">
                    <LuTriangleAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-danger font-black uppercase tracking-wider mb-1 block">{t('criticalConflict')}</span>
                      <p className="text-[hsl(var(--color-text))] text-sm leading-relaxed">
                        {t('conflictDesc1')} <span className="font-black text-danger">{t('tamsulosin04mg')}</span>{t('conflictDesc2')}
                      </p>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
