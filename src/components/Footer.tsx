"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--color-background))] border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row text-center justify-between items-center gap-8">
          {/* Footer Links */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <Link
              href="#"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline-offset-3 hover:underline font-medium text-xs uppercase"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline-offset-3 hover:underline font-medium text-xs uppercase"
            >
              Terms of Service
            </Link>
            <Link
              href="#)"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline-offset-3 hover:underline font-medium text-xs uppercase"
            >
              Clinical Standards
            </Link>
            <Link
              href="#"
              className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:underline-offset-3 hover:underline font-medium text-xs uppercase"
            >
              Contact Support
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-[hsl(var(--color-text-muted))] text-xs uppercase tracking-wider">
              © 2026 CareHub Medical Systems. Precision in Care.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
