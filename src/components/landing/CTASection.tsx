import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

export default function CTASection() {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] py-24 lg:py-24 px-6 lg:px-6">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-linear-to-br from-[hsl(var(--color-primary))] via-[hsl(var(--color-primary-strong))] to-[hsl(var(--color-secondary))] shadow-2xl shadow-[hsl(var(--color-primary)/0.2)] p-10 lg:p-15 text-center relative overflow-hidden group">
        
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity duration-1000" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight mb-6 leading-tight">
            Ready to upgrade your medical experience?
          </h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Join thousands of patients and medical professionals who have already made the switch to the most intelligent healthcare ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/register?role=patient" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto bg-white text-[hsl(var(--color-primary))] font-black hover:-translate-y-1 transition-all duration-300"
            >
              Start as Patient
            </Link>
            <Link 
              href="/register?role=doctor" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto bg-transparent border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300"
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
