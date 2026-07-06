import { LuScale, LuFileText, LuTriangleAlert, LuBadgeCheck } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))] py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="mb-16 text-center">
          <Badge variant="primary" className="mb-6 gap-2">
            <LuScale className="w-4 h-4" />
            <span>Terms of Service</span>
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight mb-4">
            Rules of the platform
          </h1>
          <p className="text-lg text-[hsl(var(--color-text-muted))]">
            Last updated: October 24, 2026
          </p>
        </div>

        <div className="bg-[hsl(var(--color-bg-surface))] rounded-[2.5rem] border border-[hsl(var(--color-border))] p-8 lg:p-12 shadow-sm space-y-12">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center">
                <LuFileText className="w-5 h-5 text-[hsl(var(--color-primary))]" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">1. Acceptance of Terms</h2>
            </div>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              By accessing and using the CareHub platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-secondary)/0.1)] flex items-center justify-center">
                <LuBadgeCheck className="w-5 h-5 text-[hsl(var(--color-secondary))]" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">2. User Accounts & Responsibilities</h2>
            </div>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-[hsl(var(--color-text-muted))] space-y-2 ml-2">
              <li><strong>Doctors:</strong> Must maintain a valid medical license. All prescriptions issued through CareHub are legally binding.</li>
              <li><strong>Patients:</strong> Must provide accurate medical history. Failure to declare known allergies may result in unsafe AI prescriptions.</li>
              <li><strong>Assistants:</strong> Are strictly forbidden from accessing patient medical histories. Access is limited to queue management and general info.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-warning)/0.1)] flex items-center justify-center">
                <LuTriangleAlert className="w-5 h-5 text-[hsl(var(--color-warning))]" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">3. Medical Disclaimer</h2>
            </div>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              CareHub acts as an intelligent conduit between patients and healthcare providers. <strong>The CareHub AI Engine is an assistive tool, not a doctor.</strong> While our AI actively flags drug-to-drug interactions and patient allergies, the final medical decision and liability rest solely with the prescribing physician. CareHub is not liable for medical errors, misdiagnoses, or delayed queue times.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-4">4. Termination of Service</h2>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              We reserve the right to modify or terminate your access to the Service for any reason, without notice, at any time. We also reserve the right to alter these Terms of Service at any time. If the alterations constitute a material change to the Terms of Service, we will notify you via email or platform notification.
            </p>
          </section>

          <hr className="border-[hsl(var(--color-border))]" />

          <p className="text-sm text-[hsl(var(--color-text-muted))] text-center">
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@carehub.com" className="text-[hsl(var(--color-primary))] hover:underline">legal@carehub.com</a>.
          </p>

        </div>
      </div>
    </main>
  );
}
