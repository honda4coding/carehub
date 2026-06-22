import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuStethoscope, LuBadgeCheck, LuActivity } from "react-icons/lu";

const Hero = () => {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-32 pb-20 lg:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] border border-[hsl(var(--color-primary)/0.2)]">
            <LuBadgeCheck className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              Clinical Grade Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-[hsl(var(--color-text))] leading-[0.95]">
            Your Complete
            <br />
            Medical History,
            <br />
            <span className="text-[hsl(var(--color-primary))]">Unified.</span>
          </h1>

          <p className="mt-8 text-lg text-[hsl(var(--color-text-muted))] max-w-xl leading-relaxed">
            Experience the sanctuary of modern healthcare. CareHub brings precision,
            clarity, and security to your medical journey, connecting patients and
            professionals seamlessly.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto">
            <Link 
              href="/register?role=patient" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto bg-[hsl(var(--color-primary))] text-white font-bold -[hsl(var(--color-primary)/0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Register as Patient
              <LuArrowRight className="h-5 w-5 shrink-0" />
            </Link>
            
            <Link 
              href="/register?role=doctor" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto bg-[hsl(var(--color-bg-white))] text-[hsl(var(--color-text))] border-2 border-[hsl(var(--color-text-muted)/0.1)] font-bold hover:border-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary))] transition-all duration-300"
            >
              Join as Doctor
              <LuStethoscope className="h-5 w-5 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Right Content - Visuals */}
        <div className="relative w-full flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative w-full max-w-md sm:max-w-xl aspect-4/5 lg:aspect-square">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-linear-to-tr from-[hsl(var(--color-primary)/0.2)] to-[hsl(var(--color-secondary)/0.2)] blur-3xl rounded-full opacity-50" />
            
            <Image
              src="/Hero.png"
              alt="Doctor consulting with patients"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover rounded-3xl sm:rounded-4xl relative z-10 border border-white/20"
            />

            {/* Floating Activity Card */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:bottom-8 sm:-left-8 bg-[hsl(var(--color-bg-surface))] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 z-20 border border-[hsl(var(--color-text-muted)/0.1)] animate-bounce-slow w-[90%] sm:w-auto max-w-[300px] sm:max-w-none">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-doctor text-white flex items-center justify-center shrink-0">
                <LuActivity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-black text-[hsl(var(--color-text))] uppercase tracking-tight truncate">
                  Vitals Synced
                </p>
                <p className="text-[9px] sm:text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase opacity-60">Real-time update</p>
                <div className="mt-2 sm:mt-3 h-1.5 w-full rounded-full bg-[hsl(var(--color-bg-soft))] overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-linear-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;