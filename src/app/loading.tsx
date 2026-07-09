import { LuLoader } from "react-icons/lu";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-2xl flex items-center justify-center mb-4">
        <LuLoader className="text-3xl text-[hsl(var(--color-primary))] animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-[hsl(var(--color-text))] animate-pulse">
        Loading...
      </h2>
      <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mt-1">
        Please wait while we prepare your content.
      </p>
    </div>
  );
}
