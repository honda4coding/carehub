import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Stethoscope, BadgeCheck, Activity } from "lucide-react";

const Hero = () => {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 lg:pt-20 pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2 bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Clinical Grade Platform
            </span>
          </div>

          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[hsl(var(--color-text))] leading-[1.05]">
            Your Complete
            <br />
            Medical History,
            <br />
            <span className="text-[hsl(var(--color-primary))]">Unified.</span>
          </h1>
          <p className="mt-8 text-base lg:text-lg text-[hsl(var(--color-text-muted))] max-w-xl leading-relaxed">
            Experience the sanctuary of modern healthcare. CareHub brings precision,
            clarity, and security to your medical journey, connecting patients and
            professionals seamlessly.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href='/' className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 bg-[hsl(var(--color-primary))] text-white font-semibold shadow-lg shadow-[hsl(var(--color-primary)/0.25)] hover:bg-[hsl(var(--color-primary-strong))] transition">
              Register as Patient
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href='/' className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-text))] font-semibold hover:bg-[hsl(var(--color-secondary))] transition">
              Join as Doctor
              <Stethoscope className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="relative w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-167.5 aspect-square">
            <Image
              src="/Hero.png"
              alt="Doctor consulting with patients"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 670px"
              className="object-cover rounded-3xl"
            />
            {/* Floating card */}
            <div className="absolute bottom-6 left-6 right-6 sm:left-8 sm:right-auto sm:max-w-xs bg-[hsl(var(--color-bg-surface))] rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[hsl(var(--color-primary))] text-white flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[hsl(var(--color-text))]">
                    Vitals Synced
                  </p>
                </div>
                <p className="text-xs text-[hsl(var(--color-text-muted))]">Just now</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[hsl(var(--color-secondary))] overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-[hsl(var(--color-primary))]" />
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
