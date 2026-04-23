"use client";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcaseMedical } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClasses = "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] font-bold text-sm transition-all duration-300";

  return (
    <nav className="bg-[hsl(var(--color-bg))]/80 backdrop-blur-md border-b border-[hsl(var(--color-text-muted)/0.1)] fixed w-full top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 bg-[hsl(var(--color-primary))] rounded-xl flex items-center justify-center shadow-lg shadow-[hsl(var(--color-primary)/0.2)] group-hover:scale-110 transition-transform"> 
              <FontAwesomeIcon icon={faBriefcaseMedical} className="text-white text-lg"/>  
            </div>
            <span className="text-xl font-black text-[hsl(var(--color-text))] tracking-tight">
              Care<span className="text-[hsl(var(--color-primary))]">Hub</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="#" className={navLinkClasses}>Platform</Link>
            <Link href="#" className={navLinkClasses}>Specialties</Link>
            <Link href="#" className={navLinkClasses}>About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[hsl(var(--color-primary))] font-bold text-sm px-5 py-2 rounded-full border-2 border-[hsl(var(--color-primary)/0.2)] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all duration-300 shadow-sm active:scale-95"
            >
              Sign in
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-text-muted)/0.1)] animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="#" className="block px-4 py-3 rounded-xl font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-primary))] transition-all">
              Platform
            </Link>
            <Link href="#" className="block px-4 py-3 rounded-xl font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-primary))] transition-all">
              Specialties
            </Link>
            <Link href="#" className="block px-4 py-3 rounded-xl font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-primary))] transition-all">
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}