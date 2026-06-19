"use client";
import Link from 'next/link';
import { LuActivity, LuChevronRight } from 'react-icons/lu';

export default function TrackerBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-strong))] p-6 sm:p-8 text-white shadow-md mb-6 group">
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-[hsl(var(--color-primary-soft))] opacity-30 rounded-full blur-3xl translate-y-1/3 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
            <LuActivity className="text-4xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black mb-1.5 tracking-tight">Stay On Top of Your Health!</h2>
            <p className="text-sm font-medium text-white/80 max-w-md">
              Log your daily vitals like blood pressure, sugar levels, and weight to monitor your personal progress over time.
            </p>
          </div>
        </div>
        
        <Link 
          href="/patient/tracking" 
          className="shrink-0 w-full md:w-auto px-6 py-3.5 bg-white text-[hsl(var(--color-primary-strong))] font-black text-sm rounded-xl hover:bg-[hsl(var(--color-bg-soft))] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          Open Health Tracker <LuChevronRight className="text-lg transition-transform group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  );
}
