"use client";
import Link from 'next/link';
import { LuActivity, LuChevronRight } from 'react-icons/lu';

interface Props {
  className?: string;
}

export default function TrackerBanner({ className = "" }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-strong))] p-6 text-white group flex flex-col justify-center ${className}`}>
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-[hsl(var(--color-primary-soft))] opacity-30 rounded-full blur-3xl translate-y-1/3 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-row flex-wrap items-center justify-between gap-4 w-full h-full">
        <div className="flex flex-row items-center gap-3 text-left flex-1 min-w-[200px]">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
            <LuActivity className="text-2xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-0.5 tracking-tight line-clamp-1">Stay On Top of Your Health!</h2>
            <p className="text-xs font-medium text-white/80 leading-relaxed line-clamp-2">
              Log your daily vitals like blood pressure, sugar levels, and weight to monitor your personal progress over time.
            </p>
          </div>
        </div>
        
        <Link 
          href="/patient/tracking" 
          className="shrink-0 w-full sm:w-auto ml-auto px-5 py-2.5 bg-white text-[hsl(var(--color-primary-strong))] font-bold text-sm rounded-xl hover:bg-[hsl(var(--color-bg-soft))] hover:-translate-y-px transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
        >
          Open Health Tracker <LuChevronRight className="text-base transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
