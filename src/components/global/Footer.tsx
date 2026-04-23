import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--color-bg))] border-t border-[hsl(var(--color-text-muted)/0.1)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row text-center justify-between items-center gap-8">
          
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center md:flex-row gap-6 md:gap-8">
            <Link
              href="/privacy"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline underline-offset-4 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline underline-offset-4 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/standards"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline underline-offset-4 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Clinical Standards
            </Link>
            <Link
              href="/support"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline underline-offset-4 font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Copyright Section */}
          <div className="text-center md:text-right">
            <p className="text-[hsl(var(--color-text-muted))] text-[10px] font-bold uppercase tracking-[0.15em] opacity-80">
              © 2026 CareHub <span className="text-[hsl(var(--color-primary))]">Medical Systems</span>. Precision in Care.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}