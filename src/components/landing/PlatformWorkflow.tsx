import { LuStethoscope, LuRefreshCcw, LuHouse, LuTrendingUp } from "react-icons/lu";

export default function PlatformWorkflow() {
  const steps = [
    {
      icon: <LuStethoscope className="w-6 h-6" />,
      title: "Clinical Encounter",
      desc: "Doctor performs diagnosis and builds a smart prescription instantly.",
    },
    {
      icon: <LuRefreshCcw className="w-6 h-6" />,
      title: "Intelligent Sync",
      desc: "Data is securely encrypted and routed directly to the patient's profile.",
    },
    {
      icon: <LuHouse className="w-6 h-6" />,
      title: "Home Tracking",
      desc: "Patient follows the interactive schedule, logs vitals, and builds adherence streaks.",
    },
    {
      icon: <LuTrendingUp className="w-6 h-6" />,
      title: "Remote Monitoring",
      desc: "Doctor monitors progress through real-time adherence analytics and charts.",
    }
  ];

  return (
    <section className="w-full bg-[hsl(var(--color-bg-soft))] py-24 lg:py-32 border-y border-[hsl(var(--color-text-muted)/0.1)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-black text-[hsl(var(--color-text))] tracking-tight mb-6">
            A Seamless Workflow
          </h2>
          <p className="text-lg text-[hsl(var(--color-text-muted))] leading-relaxed">
            Experience healthcare without friction. Our platform ensures that the medical journey doesn't end when the patient leaves the clinic.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-[hsl(var(--color-text-muted)/0.1)] -translate-y-1/2 rounded-full z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-[hsl(var(--color-bg-surface))] rounded-2xl flex items-center justify-center shadow-xl border border-[hsl(var(--color-text-muted)/0.1)] mb-6 text-[hsl(var(--color-primary))] group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[hsl(var(--color-primary)/0.25)]">
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
