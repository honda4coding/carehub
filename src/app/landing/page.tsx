import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))]">
      <Hero />
      <Features />
    </main>
  );
}
