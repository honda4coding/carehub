interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="group bg-[hsl(var(--color-bg-surface))] rounded-4xl p-8 border border-[hsl(var(--color-text-muted)/0.1)] hover:border-[hsl(var(--color-primary)/0.2)] transition-all duration-300">
    <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-primary))] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
      <div className="text-2xl">
        {icon}
      </div>
    </div>

    <h3 className="mt-8 text-xl font-bold text-[hsl(var(--color-text))] tracking-tight">
      {title}
    </h3>

    <p className="mt-4 text-sm font-medium text-[hsl(var(--color-text-muted))] leading-relaxed">
      {description}
    </p>

    <div className="mt-6 w-8 h-1 bg-[hsl(var(--color-primary))] rounded-full opacity-0 group-hover:opacity-100 group-hover:w-12 transition-all duration-500" />
  </div>
);

export default FeatureCard;