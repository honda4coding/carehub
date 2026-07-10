import Link from 'next/link';
import { LuFileQuestion, LuHouse } from 'react-icons/lu';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-[hsl(var(--color-bg-soft))] rounded-full flex items-center justify-center mb-6">
        <LuFileQuestion className="text-5xl text-[hsl(var(--color-primary))]" />
      </div>
      <h1 className="text-4xl font-black text-[hsl(var(--color-text))] mb-2 tracking-tight">
        404
      </h1>
      <h2 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-4">
        Page Not Found
      </h2>
      <p className="text-base font-medium text-[hsl(var(--color-text-muted))] max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      
      <Link 
        href="/"
        className="flex items-center gap-2 bg-[hsl(var(--color-primary))] text-white px-6 py-3 rounded-xl font-bold hover:bg-[hsl(var(--color-primary-strong))] transition-all active:scale-[0.98]"
      >
        <LuHouse className="text-lg" />
        Return Home
      </Link>
    </div>
  );
}
