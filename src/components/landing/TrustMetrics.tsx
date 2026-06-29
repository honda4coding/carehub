import { LuShieldCheck, LuLockKeyhole, LuFileBadge } from "react-icons/lu";
import { useTranslations } from 'next-intl';

export default function TrustMetrics() {
  const t = useTranslations('landing.TrustMetrics');
  const metrics = [
    {
      icon: <LuLockKeyhole className="w-8 h-8" />,
      title: t('metric1Title'),
      desc: t('metric1Desc'),
    },
    {
      icon: <LuShieldCheck className="w-8 h-8" />,
      title: t('metric2Title'),
      desc: t('metric2Desc'),
    },
    {
      icon: <LuFileBadge className="w-8 h-8" />,
      title: t('metric3Title'),
      desc: t('metric3Desc'),
    },
  ];

  return (
    <section className="w-full bg-[hsl(var(--color-bg-soft))] py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl lg:text-4xl font-black text-[hsl(var(--color-text))] tracking-tight mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[hsl(var(--color-text-muted))]">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <div 
              key={i} 
              className="bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-8 text-center border border-[hsl(var(--color-text-muted)/0.1)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[hsl(var(--color-primary))] text-white rounded-2xl shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
                {m.icon}
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-3">{m.title}</h3>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed max-w-sm mx-auto">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
