import Hero from "@/components/landing/Hero";
import BentoFeatures from "@/components/landing/BentoFeatures";
import PlatformWorkflow from "@/components/landing/PlatformWorkflow";
import AIIntelligence from "@/components/landing/AIIntelligence";
import TrustMetrics from "@/components/landing/TrustMetrics";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))]">
      <Hero />
      <BentoFeatures />
      <PlatformWorkflow />
      <AIIntelligence />
      <TrustMetrics />
      <CTASection />
    </main>
  );
}