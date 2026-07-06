import Image from "next/image";
import { LuBrainCircuit, LuGamepad2, LuFileDigit, LuActivity, LuSparkles, LuCircleCheck, LuBot } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";

export default function BentoFeatures() {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] py-24 lg:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="primary" className="mb-6 gap-2">
            <LuSparkles className="w-4 h-4" />
            <span>Omnipotent Ecosystem</span>
          </Badge>
          <h2 className="text-2xl lg:text-4xl font-black text-[hsl(var(--color-text))] tracking-tight">
            Every tool you need, <br className="hidden sm:block" />
            <span className="text-[hsl(var(--color-primary))]">perfectly synchronized.</span>
          </h2>
          <p className="mt-6 text-lg text-[hsl(var(--color-text-muted))] leading-relaxed">
            From intelligent prescription safety checks to daily medication reminders, CareHub fuses clinical precision with an unforgettable user experience.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 md:auto-rows-[280px] lg:auto-rows-[320px]">
          
          {/* Large Card: AI Safety */}
          <div className="md:col-span-2 row-span-1 md:row-span-2 rounded-[2.5rem] p-8 lg:p-12 bg-linear-to-br from-[hsl(var(--color-bg-surface))] to-[hsl(var(--color-bg))] border border-[hsl(var(--color-text-muted)/0.1)] relative overflow-hidden group flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--color-primary)/0.1)] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[hsl(var(--color-primary)/0.15)] transition-colors duration-700" />
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-primary)/0.1)] border border-[hsl(var(--color-primary)/0.2)] flex items-center justify-center shadow-[0_0_20px_-5px_hsl(var(--color-primary)/0.3)] shrink-0">
                <LuBrainCircuit className="w-7 h-7 text-[hsl(var(--color-primary))]" />
              </div>
              <h3 className="text-xl lg:text-3xl font-black text-[hsl(var(--color-text))] tracking-tight leading-tight">AI Safety Intelligence</h3>
            </div>
            
            {/* CSS Visual: AI Radar/Scan with Image */}
            <div className="relative w-full flex-1 min-h-[200px] mb-6 rounded-3xl bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-text-muted)/0.1)] overflow-hidden flex items-center justify-center">
              {/* Radar Grid */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Center AI Brain Image */}
              <div className="absolute inset-0 opacity-80 group-hover:scale-100 transition-transform duration-700 pointer-events-none">
                <Image 
                  src="/images/ai_brain.png" 
                  alt="AI Medical Brain" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center rounded-3xl"
                />
              </div>

              {/* Scanning Laser */}
              <div className="absolute top-0 left-1/2 w-full h-full bg-linear-to-b from-transparent to-[hsl(var(--color-primary)/0.2)] border-b-2 border-[hsl(var(--color-primary))] -translate-x-1/2 -translate-y-full group-hover:translate-y-full transition-transform duration-[3s] ease-in-out repeat-infinite pointer-events-none" />
              
              {/* Floating Safe Badge */}
              <div className="absolute bottom-6 right-6 bg-[hsl(var(--color-bg-surface))] px-4 py-2 rounded-full flex items-center gap-2 border border-[hsl(var(--color-border))] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-500 shadow-sm">
                <LuCircleCheck className="w-4 h-4 text-success" />
                <span className="text-xs font-bold text-[hsl(var(--color-text))]">100% Safe</span>
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed max-w-2xl">
                Prescribe with absolute confidence. Our proprietary AI engine analyzes real-time drug interactions, patient allergies, and historical medical records before the prescription is even finalized. It actively monitors for adverse effects and suggests safer alternatives instantly, ensuring that clinical workflows remain uninterrupted while maximizing patient safety.
              </p>
            </div>
          </div>

          {/* Medium Card: Smart AI Assistant (Replaced Reminders) */}
          <div className="md:col-span-1 row-span-1 rounded-[2.5rem] p-8 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-secondary)/0.1)] border border-[hsl(var(--color-secondary)/0.2)] flex items-center justify-center shadow-[0_0_15px_-5px_hsl(var(--color-secondary)/0.2)] mb-5">
                <LuBot className="w-6 h-6 text-[hsl(var(--color-secondary))]" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-2">Smart AI Assistant</h3>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed mb-6">
                Chat with our medical AI to find the perfect specialist and get personalized guidance.
              </p>
            </div>

            {/* CSS Visual: Chat Bubbles */}
            <div className="flex flex-col gap-3 relative z-10">
              <div className="bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-2xl rounded-tr-sm p-3 self-end max-w-[85%] transform group-hover:-translate-y-1 transition-transform">
                <div className="w-20 h-1.5 bg-[hsl(var(--color-text-muted)/0.2)] rounded-full mb-2" />
                <div className="w-16 h-1.5 bg-[hsl(var(--color-text-muted)/0.2)] rounded-full" />
              </div>
              <div className="bg-linear-to-r from-[hsl(var(--color-secondary))] to-[hsl(var(--color-primary))] rounded-2xl rounded-tl-sm p-3 self-start max-w-[90%] transform group-hover:translate-y-1 transition-transform">
                <div className="w-24 h-1.5 bg-white/40 rounded-full mb-2" />
                <div className="w-32 h-1.5 bg-white/40 rounded-full mb-2" />
                <div className="w-16 h-1.5 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Medium Card: Smart Rx */}
          <div className="md:col-span-1 row-span-1 rounded-[2.5rem] p-8 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-primary)/0.1)] border border-[hsl(var(--color-primary)/0.2)] flex items-center justify-center shadow-[0_0_15px_-5px_hsl(var(--color-primary)/0.2)] mb-5">
                <LuFileDigit className="w-6 h-6 text-[hsl(var(--color-primary))]" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-2">Digital Prescriptions</h3>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed mb-6">
                Instant, paperless Rx routing. Clear dosages directly in your pocket.
              </p>
            </div>

            {/* CSS Visual: Digital Rx Document */}
            <div className="relative z-10 h-24 w-full bg-[hsl(var(--color-bg))] rounded-2xl border border-[hsl(var(--color-text-muted)/0.1)] p-4 flex flex-col gap-3 overflow-hidden group-hover:bg-white transition-colors duration-300">
              <div className="w-1/3 h-2 bg-[hsl(var(--color-text-muted)/0.2)] rounded-full" />
              <div className="w-full h-2 bg-[hsl(var(--color-text-muted)/0.1)] rounded-full" />
              <div className="w-4/5 h-2 bg-[hsl(var(--color-text-muted)/0.1)] rounded-full" />
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-linear-to-br from-[hsl(var(--color-primary)/0.2)] to-transparent rounded-full flex items-center justify-center">
                <LuSparkles className="w-5 h-5 text-[hsl(var(--color-primary))]" />
              </div>
            </div>
          </div>

          {/* Wide Card: Vitals */}
          <div className="md:col-span-3 row-span-1 rounded-[2.5rem] p-8 lg:p-12 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-text-muted)/0.1)] border border-[hsl(var(--color-text-muted)/0.2)] flex items-center justify-center shadow-[0_0_15px_-5px_hsl(var(--color-text-muted)/0.1)]">
                  <LuActivity className="w-6 h-6 text-[hsl(var(--color-text))]" />
                </div>
                <h3 className="text-2xl font-bold text-[hsl(var(--color-text))]">Unified Medical Records</h3>
              </div>
              <p className="text-[hsl(var(--color-text-muted))] leading-relaxed">
                Your entire history—vitals, blood pressure, sugar levels, and lab results—consolidated into beautifully rendered, easy-to-read charts available anytime.
              </p>
            </div>
            
            {/* Visual Element for Vitals Card */}
            <div className="w-full md:w-auto flex-1 flex justify-end">
              <div className="w-full h-32 bg-[hsl(var(--color-bg))] rounded-2xl border border-[hsl(var(--color-text-muted)/0.1)] p-4 flex items-end justify-between gap-2 overflow-hidden">
                 {/* Fake Chart Bars */}
                 {[40, 70, 45, 90, 65, 80, 50, 100, 75, 85, 60, 95, 40].map((height, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-linear-to-t from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%`, transitionDelay: `${i * 30}ms` }}
                    />
                 ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
