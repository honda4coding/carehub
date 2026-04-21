interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl p-8 shadow-sm">
    <div className="h-12 w-12 rounded-full bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-primary))] flex items-center justify-center">
      {icon}
    </div>
    <h3 className="mt-12 text-xl font-semibold text-[hsl(var(--color-text))]">
      {title}
    </h3>
    <p className="mt-4 text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
      {description}
    </p>
  </div>
);

export default FeatureCard;
