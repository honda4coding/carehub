"use client";
import Link from "next/link";
import { useState } from "react";
import { FaBriefcaseMedical, FaSignOutAlt } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, isAuthenticated, logout, isLoading } = useAuth();

  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/doctor") || pathname.startsWith("/patient");
  if (isDashboard) return null;

  const navLinkClasses = "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] font-bold text-sm transition-all duration-300";

  // --- Role-Based Links Definition ---
  const getLinks = () => {
    // If we are still loading auth state, return empty to avoid flicker
    if (isLoading) return [];

    if (!isAuthenticated) {
      return [
        { label: "Platform", href: "#" },
        { label: "Specialties", href: "#" },
        { label: "About", href: "#" },
      ];
    }

    switch (role) {
      case 'admin':
        return [
          { label: "Admin Panel", href: "/admin" },
          { label: "Users Control", href: "/admin/users" },
          { label: "Analytics", href: "/admin/stats" },
        ];
      case 'doctor':
        return [
          { label: "Dashboard", href: "/doctor" },
          { label: "Profile", href: "/doctor/profile" },
        ];
      case 'patient':
        return [
          { label: "Medical History", href: "/patient/history" },
          { label: "Prescriptions", href: "/patient/prescriptions" },
          { label: "Profile", href: "/patient/profile" },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <nav className="bg-[hsl(var(--color-bg))]/80 backdrop-blur-md border-b border-[hsl(var(--color-text-muted)/0.1)] fixed w-full top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 bg-[hsl(var(--color-primary))] rounded-xl flex items-center justify-center shadow-lg shadow-[hsl(var(--color-primary)/0.2)] group-hover:scale-110 transition-transform"> 
              <FaBriefcaseMedical className="text-white text-lg"/>  
            </div>
            <span className="text-xl font-black text-[hsl(var(--color-text))] tracking-tight">
              Care<span className="text-[hsl(var(--color-primary))]">Hub</span>
            </span>
          </Link>

          {/* Dynamic Links Based on Role */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <Link key={index} href={link.href} className={navLinkClasses}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              // Pulse skeleton during hydration
              <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-full" />
            ) : !isAuthenticated ? (
              // Guest Navigation
              <>
                <div className="hidden sm:flex items-center gap-2 border-r border-[hsl(var(--color-text-muted)/0.2)] pr-4 mr-2">
                  <Link href="/login" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] font-bold text-xs transition-colors">
                    Sign In
                  </Link>
                </div>
                <Link
                  href="/register"
                  className="text-[hsl(var(--color-primary))] font-bold text-sm px-5 py-2 rounded-full border-2 border-[hsl(var(--color-primary)/0.2)] hover:bg-[hsl(var(--color-primary))] hover:text-white hover:border-[hsl(var(--color-primary))] transition-all duration-300 shadow-sm active:scale-95"
                >
                  Sign up
                </Link>
              </>
            ) : (
              // Authenticated User Navigation
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-black text-[hsl(var(--color-text))]">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold text-[hsl(var(--color-primary))] tracking-widest">{role}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
            >
              {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-text-muted)/0.1)] animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-primary))] transition-all"
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && !isAuthenticated && (
              <div className="pt-4 border-t border-[hsl(var(--color-text-muted)/0.1)] space-y-3">
                <Link
                  href="/login?role=doctor"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs font-bold py-2.5 rounded-xl border border-[hsl(var(--color-text-muted)/0.2)] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:border-[hsl(var(--color-primary))] transition-colors"
                >
                  Doctor Login
                </Link>
                <Link
                  href="/login?role=patient"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs font-bold py-2.5 rounded-xl border border-[hsl(var(--color-text-muted)/0.2)] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:border-[hsl(var(--color-primary))] transition-colors"
                >
                  Patient Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-[hsl(var(--color-primary))] text-white font-bold text-sm py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <button 
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
