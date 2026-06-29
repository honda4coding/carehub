import { LuStethoscope, LuRefreshCcw, LuHouse, LuTrendingUp } from "react-icons/lu";
import { useTranslations } from 'next-intl';

export default function PlatformWorkflow() {
  const t = useTranslations('landing.PlatformWorkflow');
  const steps = [
    {
      icon: <LuStethoscope className="w-6 h-6" />,
      title: t('step1Title'),
      desc: t('step1Desc'),
    },
    {
      icon: <LuRefreshCcw className="w-6 h-6" />,
      title: t('step2Title'),
      desc: t('step2Desc'),
    },
    {
      icon: <LuHouse className="w-6 h-6" />,
      title: t('step3Title'),
      desc: t('step3Desc'),
    },
    {
      icon: <LuTrendingUp className="w-6 h-6" />,
      title: t('step4Title'),
      desc: t('step4Desc'),
    }
  ];

  return (
    <section className="w-full bg-[hsl(var(--color-bg-soft))] py-24 lg:py-32 border-y border-[hsl(var(--color-text-muted)/0.1)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl lg:text-4xl font-black text-[hsl(var(--color-text))] tracking-tight mb-6">
            {t('title')}
          </h2>
          <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed">
            {t('description')}
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 start-0 end-0 h-1 bg-[hsl(var(--color-text-muted)/0.1)] -translate-y-1/2 rounded-full z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-[hsl(var(--color-bg-surface))] rounded-2xl flex items-center justify-center border border-[hsl(var(--color-text-muted)/0.1)] mb-6 text-[hsl(var(--color-primary))] group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-[hsl(var(--color-primary)/0.25)]">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--color-text))] text-white font-black text-xs mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-3">{step.title}</h3>
                <p className="text-[hsl(var(--color-text-muted))] leading-relaxed text-sm max-w-[250px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
