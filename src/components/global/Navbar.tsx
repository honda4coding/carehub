"use client";
import InstallButton from "@/components/pwa/InstallButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LuActivity, LuLogOut, LuMenu, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardRoutes = ["/admin", "/doctor", "/patient", "/assistant"];
  const isDashboard = dashboardRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  if (isDashboard) return null;

  const navLinkClasses = "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] font-medium text-sm transition-all duration-300";

  // --- Role-Based Links Definition ---
  const getLinks = () => {
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
          { label: "Admin Panel", href: "/admin/analytics" },
          { label: "Users Control", href: "/admin/users" },
          { label: "Approvals", href: "/admin/approvals" },
          { label: "Support", href: "/admin/support-messages" },
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
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 print:hidden ${scrolled ? 'bg-[hsl(var(--color-bg-surface))/80] backdrop-blur-xl border-b border-[hsl(var(--color-border))] shadow-[var(--shadow-sm)] py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">

          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-[hsl(var(--color-primary-soft))] p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <LuActivity className="w-5 h-5 text-[hsl(var(--color-primary-strong))]" />
            </div>
            <span className="text-xl font-bold text-[hsl(var(--color-text))] tracking-tight">
              CareHub
            </span>
          </Link>

          {/* Dynamic Links Based on Role */}
          <div className="hidden md:flex items-center gap-8 bg-[hsl(var(--color-bg-surface))/50] backdrop-blur-md px-6 py-2 rounded-full border border-[hsl(var(--color-border))]">
            {links.map((link, index) => (
              <Link key={index} href={link.href} className={navLinkClasses}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoading ? (
              <div className="w-20 h-8 bg-[hsl(var(--color-bg-soft))] animate-pulse rounded-full" />
            ) : !isAuthenticated ? (
              <>
                <InstallButton />
                <Link href="/login" className="text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-primary))] font-medium text-sm transition-colors border-r border-[hsl(var(--color-border))] pr-3 mr-1">
                  Sign In
                </Link>
                <div className="hidden sm:block">
                  <Button variant="primary" size="sm" href="/register">
                    Sign up
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <InstallButton />
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-xs font-semibold text-[hsl(var(--color-text))]">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold text-[hsl(var(--color-primary))] tracking-widest">{role}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} icon={LuLogOut} className="text-xs">
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:ring-offset-2"
            >
              {isOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden bg-[hsl(var(--color-bg-surface))] border-b border-[hsl(var(--color-border))] shadow-[var(--shadow-float)] absolute w-full animate-slide-up">
          <div className="px-4 py-4 space-y-2">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-3 rounded-xl font-medium text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-all"
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && !isAuthenticated && (
              <div className="pt-4 mt-2 border-t border-[hsl(var(--color-border-soft))] space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm font-medium py-3 rounded-xl border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-bg-soft))] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-[hsl(var(--color-primary))] text-white font-medium text-sm py-3 rounded-xl hover:bg-[hsl(var(--color-primary-strong))] active:scale-[0.98] transition-all shadow-[var(--shadow-card)]"
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
                icon={LuLogOut}
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
