import Link from "next/link";
import {
  LuArrowRight, LuHeart, LuShieldCheck, LuBrain, LuZap,
  LuUsers, LuActivity, LuFileText, LuClock, LuBadgeCheck,
  LuStethoscope
} from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

const values = [
  { icon: LuHeart,       title: "Patient First",      desc: "Every decision starts and ends with the patient's safety and experience." },
  { icon: LuShieldCheck, title: "Privacy by Design",  desc: "Phone numbers encrypted. Records role-gated. You own your data." },
  { icon: LuBrain,       title: "Clinically Precise", desc: "No noise, no clutter — only what matters in the moment of care." },
  { icon: LuZap,         title: "Built to Move Fast", desc: "A full encounter — session start to prescription — in under 5 minutes." },
];

const features = [
  { icon: LuUsers,       label: "Multi-clinic doctor management" },
  { icon: LuFileText,    label: "Unified patient medical history" },
  { icon: LuActivity,    label: "Real-time session & prescription tracking" },
  { icon: LuShieldCheck, label: "Admin verification & license review" },
  { icon: LuClock,       label: "Smart appointment scheduling" },
  { icon: LuBadgeCheck,  label: "Medication compliance monitoring" },
];



const stats = [
  { value: "3",       label: "Roles",     sub: "Admin · Doctor · Patient" },
  { value: "100%",    label: "Encrypted", sub: "Phone & sensitive fields" },
  { value: "0",       label: "Paper",     sub: "Fully digital workflows" },
  { value: "Real-time", label: "Updates", sub: "Across all actions" },
];

export default function AboutPage() {
    const t = useTranslations("auto");
  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))]">

      {/* ── HERO: split layout ── */}
      <section className="w-full bg-[hsl(var(--color-bg))] pt-24 lg:pt-32 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Eyebrow */}
          <div className="mb-10">
            <Badge variant="primary" className="gap-2">
              <LuStethoscope className="w-4 h-4" />
              {t('ourStory')}</Badge>
          </div>

          {/* Two-col headline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end pb-16 border-b border-[hsl(var(--color-text-muted)/0.08)]">
            <h1 className="text-[clamp(40px,6vw,80px)] font-black tracking-tighter text-[hsl(var(--color-text))] leading-[1.0]">
              {t('healthcare')}<br />
              {t('deserves')}<br />
              <span className="text-[hsl(var(--color-primary))]">{t('better')}</span>
            </h1>
            <div>
              <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed mb-8 max-w-lg">
                {t('carehubWasBornFrom')}</p>
              <Link href="/register?role=patient">
                <Button variant="primary" size="lg" className="shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
                  {t('getStarted')}<LuArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[hsl(var(--color-text-muted)/0.08)] border-b border-[hsl(var(--color-text-muted)/0.08)]">
            {stats.map((s, i) => (
              <div key={i} className="py-10 px-6 first:pl-0">
                <p className="text-4xl lg:text-5xl font-black text-[hsl(var(--color-primary))] tracking-tighter">{s.value}</p>
                <p className="text-[hsl(var(--color-text))] font-black text-sm mt-1">{s.label}</p>
                <p className="text-[hsl(var(--color-text-muted))] text-xs mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION: two cards ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg-soft))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Problem */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2.5rem] p-10 lg:p-12">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--color-text-muted))] mb-5 block">{t('theProblem')}</span>
              <h2 className="text-2xl lg:text-3xl font-black text-[hsl(var(--color-text))] tracking-tight leading-tight mb-5">
                {t('fragmentedRecords')}<br />{t('repeatedTests')}<br />{t('lostHistory')}</h2>
              <p className="text-[hsl(var(--color-text-muted))] leading-relaxed text-[15px]">
                {t('patientsCarriedPaperFolders')}</p>
            </div>

            {/* Solution */}
            <div className="bg-[hsl(var(--color-primary))] rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-5 block">{t('ourAnswer')}</span>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight mb-5">
                {t('oneRecord')}<br />{t('everyDoctor')}<br />{t('anywhere')}</h2>
              <p className="text-white/80 leading-relaxed text-[15px]">
                {t('carehubConnectsPatientsDoctors')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-14">
            <Badge variant="primary" className="mb-5 gap-2">{t('whatWeStandFor')}</Badge>
            <h2 className="text-3xl lg:text-[48px] font-black text-[hsl(var(--color-text))] tracking-tight leading-tight">
              {t('fourPrinciples')}<br />{t('nonnegotiable')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2rem] p-8 hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--color-primary)/0.1)] group-hover:bg-[hsl(var(--color-primary))] flex items-center justify-center mb-6 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[hsl(var(--color-primary))] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--color-text-muted))] mb-2 block">0{i + 1}</span>
                  <h3 className="text-lg font-black text-[hsl(var(--color-text))] mb-2">{v.title}</h3>
                  <p className="text-[13px] text-[hsl(var(--color-text-muted))] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg-soft))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="lg:sticky lg:top-24">
              <Badge variant="primary" className="mb-5 gap-2">{t('thePlatform')}</Badge>
              <h2 className="text-3xl lg:text-[48px] font-black text-[hsl(var(--color-text))] tracking-tight leading-tight mb-5">
                {t('everythingIn')}<br />{t('onePlace')}<br />{t('finally')}</h2>
              <p className="text-[hsl(var(--color-text-muted))] leading-relaxed text-[15px] max-w-md mb-8">
                {t('carehubConnectsDoctorsPatients')}</p>
              <Link href="/register?role=patient">
                <Button variant="outline" size="lg" className="bg-[hsl(var(--color-bg-surface))]">
                  {t('startFree')}<LuArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Feature list */}
            <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2.5rem] overflow-hidden">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-8 py-5 border-b border-[hsl(var(--color-text-muted)/0.07)] last:border-b-0 hover:bg-[hsl(var(--color-primary)/0.03)] group transition-colors duration-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[hsl(var(--color-primary)/0.08)] group-hover:bg-[hsl(var(--color-primary)/0.15)] flex items-center justify-center shrink-0 transition-colors duration-200">
                      <Icon className="w-4 h-4 text-[hsl(var(--color-primary))]" />
                    </div>
                    <span className="text-[hsl(var(--color-text))] font-semibold text-[14px] flex-1">{f.label}</span>
                    <LuArrowRight className="w-4 h-4 text-[hsl(var(--color-text-muted)/0.3)] opacity-0 group-hover:opacity-100 group-hover:text-[hsl(var(--color-primary))] transition-all duration-200" />
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>




      {/* ── CTA ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg-soft))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="bg-[hsl(var(--color-primary))] rounded-[2.5rem] p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-3">{t('ready')}</p>
                <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                  {t('yourHealthRecord')}<br />{t('unified')}</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/register?role=patient">
                  <Button size="lg" className="bg-white text-[hsl(var(--color-primary-strong))] hover:bg-white/90 shadow-xl font-black">
                    {t('joinAsPatient')}<LuArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold">
                    {t('browseDoctors')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}