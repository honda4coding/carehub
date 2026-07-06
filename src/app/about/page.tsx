import Link from "next/link";
import {
  LuArrowRight, LuHeart, LuShieldCheck, LuBrain, LuZap,
  LuUsers, LuActivity, LuFileText, LuClock, LuBadgeCheck,
  LuStethoscope
} from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const values = [
  { icon: LuHeart,       title: "Patient First",      desc: "Every decision starts and ends with the patient's safety and experience." },
  { icon: LuBrain,       title: "AI-Powered Safety",  desc: "Proprietary AI flags severe drug interactions and allergies in real-time." },
  { icon: LuShieldCheck, title: "Privacy by Design",  desc: "Phone numbers encrypted. Records role-gated. You completely own your data." },
  { icon: LuZap,         title: "Zero Paperwork",     desc: "Fully digital queues, electronic prescriptions, and instant medical history access." },
];

const features = [
  { icon: LuBrain,       label: "Real-time AI safety",            desc: "Instantly flags severe drug interactions and allergies before prescribing." },
  { icon: LuActivity,    label: "Live session tracking",          desc: "Monitor queues, encounter durations, and patient status in real-time." },
  { icon: LuFileText,    label: "Unified digital history",        desc: "Access a complete, cross-clinic digital medical record instantly." },
  { icon: LuStethoscope, label: "Multi-clinic management",        desc: "Manage multiple branches, schedules, and doctors from one dashboard." },
  { icon: LuClock,       label: "Smart queue scheduling",         desc: "Automated booking, appointment reminders, and live wait-time estimations." },
  { icon: LuBadgeCheck,  label: "Automated compliance",           desc: "Ensure all medical regulations, privacy rules, and standards are met." },
];



const stats = [
  { value: "3",       label: "Roles",     sub: "Admin · Doctor · Patient" },
  { value: "100%",    label: "Encrypted", sub: "Phone & sensitive fields" },
  { value: "0",       label: "Paper",     sub: "Fully digital workflows" },
  { value: "Real-time", label: "Updates", sub: "Across all actions" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))]">

      {/* ── HERO: split layout ── */}
      <section className="w-full bg-[hsl(var(--color-bg))] pt-24 lg:pt-32 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* Eyebrow */}
          <div className="mb-10">
            <Badge variant="primary" className="gap-2">
              <LuStethoscope className="w-4 h-4" />
              Our Story
            </Badge>
          </div>

          {/* Two-col headline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end pb-16 border-b border-[hsl(var(--color-text-muted)/0.08)]">
            <h1 className="text-[clamp(40px,6vw,80px)] font-black tracking-tighter text-[hsl(var(--color-text))] leading-[1.0]">
              Healthcare<br />
              deserves<br />
              <span className="text-[hsl(var(--color-primary))]">better.</span>
            </h1>
            <div>
              <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed mb-8 max-w-lg">
                CareHub was born from a simple frustration — medical records lived everywhere except where they were needed. We built the platform we wished existed.
              </p>
              <Link href="/register?role=patient">
                <Button variant="primary" size="lg" className="shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
                  Get Started
                  <LuArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-12 border-t border-b border-[hsl(var(--color-text-muted)/0.08)] mt-12">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col">
                <p className="text-4xl lg:text-5xl font-black text-[hsl(var(--color-primary))] tracking-tighter">{s.value}</p>
                <p className="text-[hsl(var(--color-text))] font-black text-sm mt-2">{s.label}</p>
                <p className="text-[hsl(var(--color-text-muted))] text-xs mt-1">{s.sub}</p>
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--color-text-muted))] mb-5 block">The Problem</span>
              <h2 className="text-2xl lg:text-3xl font-black text-[hsl(var(--color-text))] tracking-tight leading-tight mb-5">
                Fragmented records.<br />Dangerous errors.<br />Endless waiting.
              </h2>
              <p className="text-[hsl(var(--color-text-muted))] leading-relaxed text-[16px]">
                Patients carry paper folders between clinics. Critical drug interactions are missed due to human error. Doctors waste time on manual data entry instead of patient care. The system is broken.
              </p>
            </div>

            {/* Solution */}
            <div className="bg-[hsl(var(--color-primary))] rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden group shadow-2xl shadow-[hsl(var(--color-primary)/0.2)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/30 transition-colors duration-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-5 block">Our Answer</span>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight mb-5">
                AI Intelligence.<br />Unified data.<br />Flawless workflows.
              </h2>
              <p className="text-white/90 leading-relaxed text-[16px]">
                CareHub replaces paper with an intelligent ecosystem. Our AI actively prevents prescription errors, while our digital queues and unified records ensure every doctor has the full context instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-14">
            <Badge variant="primary" className="mb-5 gap-2">What we stand for</Badge>
            <h2 className="text-3xl lg:text-[48px] font-black text-[hsl(var(--color-text))] tracking-tight leading-tight">
              Four principles.<br />Non-negotiable.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2rem] p-8 hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-primary)/0.1)] group-hover:bg-[hsl(var(--color-primary))] flex items-center justify-center transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[hsl(var(--color-primary))] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-5xl lg:text-6xl font-black tracking-tighter text-[hsl(var(--color-text-muted)/0.15)] group-hover:text-[hsl(var(--color-primary)/0.3)] transition-colors duration-500 leading-none">0{i + 1}</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black text-[hsl(var(--color-text))] mb-4 group-hover:text-[hsl(var(--color-primary))] transition-colors duration-300">{v.title}</h3>
                  <p className="text-[16px] text-[hsl(var(--color-text-muted))] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg-soft))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          
          <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-24 flex flex-col items-center">
            <Badge variant="primary" className="mb-6 gap-2">
              <LuZap className="w-4 h-4" />
              The Platform
            </Badge>
            <h2 className="text-3xl lg:text-[56px] font-black text-[hsl(var(--color-text))] tracking-tighter leading-tight mb-8">
              An intelligent medical hub,<br className="hidden sm:block" /> finally.
            </h2>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed text-lg lg:text-xl max-w-2xl mb-10">
              CareHub connects doctors, patients, and intelligent AI assistants in a single coherent workflow. From real-time allergy detection to fully digital queue management.
            </p>
            <Link href="/register?role=patient">
              <Button variant="primary" size="lg" className="rounded-2xl px-10 h-14 text-lg font-black shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
                Start Free <LuArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col p-8 lg:p-10 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-[2.5rem] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_hsl(var(--color-primary)/0.15)] shadow-[var(--shadow-sm)] transition-all duration-300 group"
                >
                  <div className="w-16 h-16 mb-8 rounded-[1.25rem] bg-[hsl(var(--color-primary)/0.05)] border border-[hsl(var(--color-primary)/0.1)] group-hover:bg-[hsl(var(--color-primary)/0.1)] group-hover:scale-110 flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm">
                    <Icon className="w-8 h-8 text-[hsl(var(--color-primary))]" />
                  </div>
                  <div className="flex-1 flex flex-col justify-start">
                    <h3 className="text-[hsl(var(--color-text))] font-black text-xl lg:text-2xl leading-tight mb-4 group-hover:text-[hsl(var(--color-primary))] transition-colors duration-300">{f.label}</h3>
                    <p className="text-[hsl(var(--color-text-muted))] text-[16px] leading-relaxed m-0">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>




      {/* ── CTA ── */}
      <section className="w-full py-24 lg:py-32 bg-[hsl(var(--color-bg-soft))] px-6 lg:px-10">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-linear-to-br from-[hsl(var(--color-primary)/0.05)] to-[hsl(var(--color-primary)/0.15)] border border-[hsl(var(--color-primary)/0.1)] shadow-2xl shadow-[hsl(var(--color-primary)/0.05)] p-12 lg:p-20 text-center relative overflow-hidden group backdrop-blur-3xl">
          
          {/* Glowing orb background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[hsl(var(--color-primary)/0.1)] blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[hsl(var(--color-secondary)/0.1)] blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />
          
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[hsl(var(--color-primary-strong))] text-sm font-black uppercase tracking-[0.2em] mb-4">Ready?</p>
            <h2 className="text-3xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tighter leading-tight mb-8">
              The smartest health ecosystem,<br className="hidden sm:block" /> at your fingertips.
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
              <Link 
                href="/register?role=patient" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto border border-transparent !bg-[hsl(var(--color-primary))] !text-white font-black hover:!bg-[hsl(var(--color-primary-strong))] hover:!text-white hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_hsl(var(--color-primary)/0.6)] transition-all duration-300"
              >
                Join as Patient <LuArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/doctors" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto border border-[hsl(var(--color-primary)/0.3)] !text-[hsl(var(--color-primary))] !bg-[hsl(var(--color-bg-surface))] hover:!bg-[hsl(var(--color-primary))] hover:!text-white font-black hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                Browse Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}