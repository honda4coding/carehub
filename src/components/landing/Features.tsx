import { ShieldPlus, ClipboardList, BadgeCheck } from "lucide-react";
import FeatureCard from "../ui/FeatureCard";

const Features = () => {
  const items = [
    {
      icon: <ShieldPlus className="h-6 w-6 text-[hsl(var(--color-primary))]" />,
      title: "Secure Records",
      description:
        "End-to-end encrypted medical histories accessible only by you and your authorized healthcare providers.",
    },
    {
      icon: <ClipboardList className="h-6 w-6 text-[hsl(var(--color-primary))]" />,
      title: "Instant Prescriptions",
      description:
        "Digital prescriptions routed directly to your preferred pharmacy with automated refill tracking.",
    },
    {
      icon: <BadgeCheck className="h-6 w-6 text-[hsl(var(--color-primary))]" />,
      title: "Verified Professionals",
      description:
        "Connect with a curated network of board-certified specialists available for telehealth or in-person visits.",
    },
  ];

  return (
    <section className="w-full bg-[hsl(var(--color-bg-soft))]"> 
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.1)] rounded-full">
            Core Features
          </span>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight">
            Architectural <span className="text-[hsl(var(--color-primary))]">Serenity</span> for Healthcare
          </h2>
          <p className="mt-6 text-lg text-[hsl(var(--color-text-muted))] leading-relaxed max-w-2xl mx-auto">
            Built on principles of clean architecture to reduce cognitive load and enhance clinical precision.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.title} className="hover:-translate-y-1.25 transition-transform duration-300">
               <FeatureCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;