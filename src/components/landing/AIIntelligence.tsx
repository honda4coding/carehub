import { LuBrainCircuit, LuTriangleAlert, LuCircleCheck } from "react-icons/lu";

export default function AIIntelligence() {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] py-24 lg:py-32 relative overflow-hidden border-y border-[hsl(var(--color-text-muted)/0.1)]">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-linear-to-bl from-[hsl(var(--color-primary)/0.05)] to-transparent blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-linear-to-tr from-[hsl(var(--color-secondary)/0.05)] to-transparent blur-[80px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Text */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.1)] rounded-full border border-[hsl(var(--color-primary)/0.2)]">
            <LuBrainCircuit className="w-4 h-4" />
            <span>Core Intelligence</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight mb-6">
            Preventing medical errors before they happen.
          </h2>
          
          <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed mb-10 max-w-xl">
            CareHub's proprietary AI engine cross-references every new prescription against the patient's entire medical history, instantly detecting dangerous drug-drug interactions and severe allergies.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <LuCircleCheck className="w-6 h-6 text-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <h4 className="text-[hsl(var(--color-text))] font-bold text-lg mb-1">Real-time Analysis</h4>
                <p className="text-[hsl(var(--color-text-muted))] text-sm leading-relaxed">Interactions are flagged instantly while the doctor types, ensuring clinical flow is never interrupted.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 shrink-0">
                <LuCircleCheck className="w-6 h-6 text-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <h4 className="text-[hsl(var(--color-text))] font-bold text-lg mb-1">Context-Aware Safety</h4>
                <p className="text-[hsl(var(--color-text-muted))] text-sm leading-relaxed">The AI considers active medications, chronic conditions, and past allergies simultaneously.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual: Mock AI Interface */}
        <div className="relative">
          {/* Subtle glow behind the card */}
          <div className="absolute inset-0 bg-linear-to-tr from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] rounded-3xl blur-2xl opacity-10 animate-pulse" />
          
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-text-muted)/0.1)] rounded-3xl p-6 lg:p-8 shadow-2xl relative z-10">
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[hsl(var(--color-text-muted)/0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-500 font-black tracking-widest text-xs uppercase">Interaction Alert</span>
              </div>
              <span className="text-[hsl(var(--color-text-muted))] font-mono text-xs font-bold">AI Confidence: 99.8%</span>
            </div>

            <div className="space-y-4">
               {/* Mock Rx Input */}
               <div className="bg-[hsl(var(--color-bg))] rounded-xl p-4 border border-[hsl(var(--color-text-muted)/0.1)]">
                  <span className="text-xs text-[hsl(var(--color-text-muted))] font-bold uppercase tracking-wider mb-2 block">New Prescription</span>
                  <div className="text-[hsl(var(--color-text))] font-mono font-bold text-sm">Sildenafil 50mg</div>
               </div>

               {/* Interaction Path */}
               <div className="flex justify-center py-2">
                 <div className="w-px h-8 bg-linear-to-b from-transparent via-red-500/50 to-transparent" />
               </div>

               {/* Mock Patient History Conflict */}
               <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <LuTriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-red-600 font-black uppercase tracking-wider mb-1 block">Critical Conflict Detected</span>
                      <p className="text-[hsl(var(--color-text))] text-sm leading-relaxed">
                        Patient is currently active on <span className="font-black text-red-600">Tamsulosin 0.4mg</span>. Co-administration may result in severe symptomatic hypotension.
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
