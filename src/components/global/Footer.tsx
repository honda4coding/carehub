"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuActivity } from "react-icons/lu";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/doctor") || pathname.startsWith("/patient") || pathname.startsWith("/assistant");
  if (isDashboard) return null;

  return (
    <footer className="bg-[hsl(var(--color-bg))] border-t border-[hsl(var(--color-border))] mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center md:text-left">
          
          {/* Brand & Description */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-[hsl(var(--color-primary-soft))] p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <LuActivity className="w-5 h-5 text-[hsl(var(--color-primary-strong))]" />
              </div>
              <span className="text-xl font-bold text-[hsl(var(--color-text))] tracking-tight">
                CareHub
              </span>
            </Link>
            <p className="text-[hsl(var(--color-text-muted))] text-sm font-normal leading-relaxed max-w-xs mt-2">
              Empowering healthcare professionals and patients with an integrated, intelligent, and seamless medical ecosystem.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-[hsl(var(--color-text))] text-xs font-semibold uppercase tracking-wider mb-1">Quick Links</h4>
            <Link href="/" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-sm font-medium transition-colors">Home</Link>
            <Link href="/about" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-sm font-medium transition-colors">About Us</Link>
            <Link href="/doctors" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-sm font-medium transition-colors">Find a Doctor</Link>
          </div>

          {/* Legal & Support */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-[hsl(var(--color-text))] text-xs font-semibold uppercase tracking-wider mb-1">Legal & Support</h4>
            <Link href="/privacy" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-sm font-medium transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-sm font-medium transition-colors">Terms of Service</Link>
            <Link href="/support" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-sm font-medium transition-colors">Contact Support</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[hsl(var(--color-border-soft))] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[hsl(var(--color-text-muted))] text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} CareHub <span className="text-[hsl(var(--color-primary))]">Medical Systems</span>.
          </p>
          <p className="text-[hsl(var(--color-text-muted))] text-xs font-medium tracking-widest opacity-80 uppercase">
            Precision in Care.
          </p>
        </div>
      </div>
    </footer>
  );
}
