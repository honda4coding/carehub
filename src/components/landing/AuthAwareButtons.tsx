"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuArrowRight, LuStethoscope, LuLayoutDashboard } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export function HeroButtons() {
  const { token, role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto">
        <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg opacity-0">
          Loading...
        </Button>
      </div>
    );
  }

  if (token && role) {
    return (
      <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto">
        <Link href={`/${role}`} passHref className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
            Go to Dashboard
            <LuLayoutDashboard className="ml-2 w-5 h-5 shrink-0" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
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
  );
}

export function CTAButtons() {
  const { token, role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
        <div className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto border border-transparent opacity-0">
          Loading...
        </div>
      </div>
    );
  }

  if (token && role) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
        <Link 
          href={`/${role}`} 
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 w-full sm:w-auto border border-transparent bg-[hsl(var(--color-primary))] text-white font-black hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_hsl(var(--color-primary)/0.6)] transition-all duration-300"
        >
          Go to Dashboard
          <LuArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
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
  );
}
