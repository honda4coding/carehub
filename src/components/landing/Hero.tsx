import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuStethoscope, LuBadgeCheck, LuActivity } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const Hero = () => {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 lg:pt-28 pb-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col">
          {/* Badge */}
          <Badge variant="primary" className="self-start gap-2 mb-8 shadow-sm">
            <LuBadgeCheck className="w-4 h-4" />
            <span>Clinical Grade Platform</span>
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tighter text-[hsl(var(--color-text))] leading-[1.1] lg:leading-[1.05]">
            Your Complete
            <br />
            Medical History,
            <br />
            <span className="text-[hsl(var(--color-primary))]">Unified.</span>
          </h1>

          <p className="mt-6 text-base lg:text-lg text-[hsl(var(--color-text-muted))] max-w-xl leading-relaxed">
            Experience the sanctuary of modern healthcare. CareHub brings precision,
            clarity, and security to your medical journey, connecting patients and
            professionals seamlessly.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto">
            <Link href="/register?role=patient" passHref className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
                Register as Patient
                <LuArrowRight className="ml-2 w-5 h-5 shrink-0" />
              </Button>
            </Link>
            
            <Link href="/register?role=doctor" passHref className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full bg-[hsl(var(--color-bg-surface))]">
                Join as Doctor
                <LuStethoscope className="ml-2 w-5 h-5 shrink-0" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Content - Visuals */}
        <div className="relative w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
          <div className="relative w-full max-w-md sm:max-w-xl aspect-[4/5] lg:aspect-square">
            {/* Background Glow */}
            <div className="absolute -inset-6 bg-linear-to-tr from-[hsl(var(--color-primary)/0.15)] to-[hsl(var(--color-secondary)/0.15)] blur-3xl rounded-full opacity-60 pointer-events-none" />
            
            <Image
              src="/Hero.png"
              alt="Doctor consulting with patients"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover rounded-[2.5rem] relative z-10 border border-white/20 shadow-2xl shadow-[hsl(var(--color-primary)/0.05)]"
            />

            {/* Floating Activity Card */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:bottom-8 sm:-left-10 bg-[hsl(var(--color-bg-surface))] rounded-2xl p-5 flex items-center gap-4 z-20 shadow-xl shadow-[hsl(var(--color-text-muted)/0.05)] border border-[hsl(var(--color-border-soft))] animate-bounce-slow w-[90%] sm:w-auto min-w-[260px]">
              <div className="w-12 h-12 rounded-xl bg-gradient-doctor text-white flex items-center justify-center shrink-0 shadow-inner">
                <LuActivity className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-[hsl(var(--color-text))] uppercase tracking-tight truncate">
                  Vitals Synced
                </p>
                <p className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase opacity-70 mt-0.5">Real-time update</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-[hsl(var(--color-bg-surface-hover))] overflow-hidden">
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