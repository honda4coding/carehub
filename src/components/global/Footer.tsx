"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuActivity } from "react-icons/lu";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/doctor") || pathname.startsWith("/patient");
  if (isDashboard) return null;

  return (
    <footer className="bg-[hsl(var(--color-bg))] border-t border-[hsl(var(--color-text-muted)/0.1)] mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center md:text-left">
          
          {/* Brand & Description */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <LuActivity className="w-8 h-8 text-[hsl(var(--color-primary))] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-[hsl(var(--color-text))] tracking-tight">
                CareHub
              </span>
            </Link>
            <p className="text-[hsl(var(--color-text-muted))] text-xs font-semibold leading-relaxed max-w-xs">
              Empowering healthcare professionals and patients with an integrated, intelligent, and seamless medical ecosystem.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-[hsl(var(--color-text))] text-sm font-black uppercase tracking-wider mb-2">Quick Links</h4>
            <Link href="/" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">Home</Link>
            <Link href="/about" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">About Us</Link>
            <Link href="/doctors" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">Find a Doctor</Link>
          </div>

          {/* Legal & Support */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-[hsl(var(--color-text))] text-sm font-black uppercase tracking-wider mb-2">Legal & Support</h4>
            <Link href="/privacy" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">Terms of Service</Link>
            <Link href="/support" className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] text-xs font-bold transition-colors">Contact Support</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[hsl(var(--color-text-muted)/0.1)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} CareHub <span className="text-[hsl(var(--color-primary))]">Medical Systems</span>.
          </p>
          <p className="text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-widest opacity-80">
            Precision in Care.
          </p>
        </div>
      </div>
    </footer>
  );
}