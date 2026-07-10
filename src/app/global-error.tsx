'use client';

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Critical Application Error</h1>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#64748b' }}>A fatal error occurred at the layout level.</p>
          <button 
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 700, backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
