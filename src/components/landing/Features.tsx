import { ShieldPlus, ClipboardList, BadgeCheck } from "lucide-react";
import FeatureCard from "./FeatureCard";

const Features = () => {
  const items = [
    {
      icon: <ShieldPlus className="h-5 w-5" />,
      title: "Secure Records",
      description:
        "End-to-end encrypted medical histories accessible only by you and your authorized healthcare providers.",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      title: "Instant Prescriptions",
      description:
        "Digital prescriptions routed directly to your preferred pharmacy with automated refill tracking.",
    },
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      title: "Verified Professionals",
      description:
        "Connect with a curated network of board-certified specialists available for telehealth or in-person visits.",
    },
  ];

  return (
    <section className="w-full bg-[hsl(var(--color-badge-bg))]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[hsl(var(--color-text))]">
            Architectural Serenity for Healthcare
          </h2>
          <p className="mt-5 text-base text-[hsl(var(--color-text-muted))]">
            Built on principles of clean architecture to reduce cognitive load and enhance clinical precision.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
