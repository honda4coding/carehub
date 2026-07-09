'use client';

import { useEffect } from 'react';
import { LuTriangleAlert, LuRefreshCcw } from 'react-icons/lu';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[hsl(var(--color-danger-bg))] rounded-full flex items-center justify-center mb-6">
        <LuTriangleAlert className="text-4xl text-[hsl(var(--color-danger))]" />
      </div>
      <h1 className="text-3xl font-black text-[hsl(var(--color-text))] mb-3 tracking-tight">
        Oops! Something went wrong
      </h1>
      <p className="text-base font-medium text-[hsl(var(--color-text-muted))] max-w-md mb-8">
        We apologize for the inconvenience. An unexpected error has occurred. Please try again.
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-[hsl(var(--color-primary))] text-white px-6 py-3 rounded-xl font-bold hover:bg-[hsl(var(--color-primary-strong))] transition-all active:scale-[0.98]"
      >
        <LuRefreshCcw className="text-lg" />
        Try Again
      </button>
    </div>
  );
}
