"use client";
import InstallButton from "@/components/pwa/InstallButton";
import Link from "next/link";
import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { LuActivity } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, isAuthenticated, logout, isLoading } = useAuth();

  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/doctor") || pathname.startsWith("/patient") || pathname.startsWith("/assistant");
  if (isDashboard) return null;

  const navLinkClasses = "text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-primary))] font-bold text-sm transition-all duration-300";

  // --- Role-Based Links Definition ---
  const getLinks = () => {
    // If we are still loading auth state, return empty to avoid flicker
    if (isLoading) return [];

    if (!isAuthenticated) {
      return [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Doctors", href: "/doctors" },
      ];
    }

    switch (role) {
      case 'admin':
        return [
          { label: "Admin Panel", href: "/admin" },
          { label: "Users Control", href: "/admin/users" },
          { label: "Approvals", href: "/admin/approvals" },
        ];
      case 'doctor':
        return [
          { label: "Dashboard", href: "/doctor" },
          { label: "Profile", href: "/doctor/profile" },
        ];
      case 'assistant':
        return [
          { label: "Dashboard", href: "/assistant" },
          { label: "Settings", href: "/assistant/settings" },
        ];
      case 'patient':
        return [
          { label: "Dashboard", href: "/patient" },
          { label: "Medical History", href: "/patient/history" },
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
            <LuActivity className="w-8 h-8 text-[hsl(var(--color-primary))] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-[hsl(var(--color-text))] tracking-tight">
              CareHub
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
            <ThemeToggle />
            {isLoading ? (
              <div className="w-20 h-8 bg-soft animate-pulse rounded-full" />
            ) : !isAuthenticated ? (
              <>
                <InstallButton />
                <Link href="/login" className="text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-primary))] font-bold text-sm transition-colors border-r border-[hsl(var(--color-text-muted)/0.2)] pr-4 mr-2">
                  Sign In
                </Link>
                <div className="hidden sm:block">
                  <Button variant="primary" size="sm" href="/register">
                    Sign up
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <InstallButton />
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-black text-[hsl(var(--color-text))]">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold text-[hsl(var(--color-primary))] tracking-widest">{role}</span>
                </div>
                <Button variant="danger" size="sm" onClick={logout} icon={FaSignOutAlt}>
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
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
                className="block text-center px-4 py-3 rounded-xl font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-primary))] transition-all"
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && !isAuthenticated && (
              <div className="pt-4 border-t border-[hsl(var(--color-text-muted)/0.1)] space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-bold py-3 rounded-xl border border-[hsl(var(--color-text-muted)/0.2)] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:border-[hsl(var(--color-primary))] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-[hsl(var(--color-primary))] text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <Button
                variant="danger"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full mt-4"
                icon={FaSignOutAlt}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
