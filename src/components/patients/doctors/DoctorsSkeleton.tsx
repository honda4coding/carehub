export default function DoctorsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-5 h-56">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-border-soft))]" />
            <div className="flex-1">
              <div className="h-4 bg-[hsl(var(--color-border-soft))] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[hsl(var(--color-border-soft))] rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-[hsl(var(--color-border-soft))] rounded w-full mb-2" />
          <div className="h-10 bg-[hsl(var(--color-border-soft))] rounded-xl w-full mt-5" />
        </div>
      ))}
    </div>
  );
}
