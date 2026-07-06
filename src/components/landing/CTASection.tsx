import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

export default function CTASection() {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] py-24 lg:py-32 px-6 lg:px-10">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-linear-to-br from-[hsl(var(--color-primary)/0.05)] to-[hsl(var(--color-primary)/0.15)] border border-[hsl(var(--color-primary)/0.1)] shadow-2xl shadow-[hsl(var(--color-primary)/0.05)] p-10 lg:p-20 text-center relative overflow-hidden group backdrop-blur-3xl">
        
        {/* Glowing orb background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[hsl(var(--color-primary)/0.1)] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[hsl(var(--color-secondary)/0.1)] blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight mb-6 leading-tight">
            Ready to upgrade your <br className="hidden sm:block"/> medical experience?
          </h2>
          <p className="text-[hsl(var(--color-text-muted))] font-medium text-lg max-w-2xl mx-auto mb-10 leading-relaxed mix-blend-multiply">
            Join thousands of patients and medical professionals who have already made the switch to the most intelligent healthcare ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/register?role=patient" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto border border-transparent bg-[hsl(var(--color-primary))] text-white font-black hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_hsl(var(--color-primary)/0.6)] transition-all duration-300"
            >
              Start as Patient
            </Link>
            <Link 
              href="/register?role=doctor" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto border border-[hsl(var(--color-primary)/0.3)] !text-[hsl(var(--color-primary))] !bg-[hsl(var(--color-bg-surface))] hover:!bg-[hsl(var(--color-primary))] hover:!text-white font-black hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              Start as Doctor
              <LuArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
