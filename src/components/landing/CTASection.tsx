import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

export default function CTASection() {
  return (
    <section className="w-full bg-[hsl(var(--color-bg))] py-24 lg:py-32 px-6 lg:px-10">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-linear-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] p-10 lg:p-20 text-center shadow-2xl relative overflow-hidden group">
        
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity duration-1000" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Ready to upgrade your <br className="hidden sm:block"/> medical experience?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of patients and medical professionals who have already made the switch to the most intelligent healthcare ecosystem.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/register?role=patient" 
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto bg-white text-[hsl(var(--color-primary))] font-black shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
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
