import { LuShieldCheck, LuLock, LuEye, LuServer } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))] py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="mb-16 text-center">
          <Badge variant="primary" className="mb-6 gap-2">
            <LuShieldCheck className="w-4 h-4" />
            <span>Privacy Policy</span>
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight mb-4">
            How we protect your data
          </h1>
          <p className="text-lg text-[hsl(var(--color-text-muted))]">
            Last updated: October 24, 2026
          </p>
        </div>

        <div className="bg-[hsl(var(--color-bg-surface))] rounded-[2.5rem] border border-[hsl(var(--color-border))] p-8 lg:p-12 shadow-sm space-y-12">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center">
                <LuEye className="w-5 h-5 text-[hsl(var(--color-primary))]" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">1. Information We Collect</h2>
            </div>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              When you use CareHub, we collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes:
            </p>
            <ul className="list-disc list-inside text-[hsl(var(--color-text-muted))] space-y-2 ml-2">
              <li><strong>Account Data:</strong> Name, National ID, Phone Number, and Role (Patient, Doctor, or Assistant).</li>
              <li><strong>Medical Data:</strong> Complete digital medical history, active prescriptions, blood type, and detected allergies.</li>
              <li><strong>Clinic Data:</strong> Live queue positioning, appointment times, and encounter durations.</li>
              <li><strong>AI Interactions:</strong> Data processed by our proprietary AI for prescription safety checks and anomaly detection.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-secondary)/0.1)] flex items-center justify-center">
                <LuLock className="w-5 h-5 text-[hsl(var(--color-secondary))]" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">2. How We Use Your Information</h2>
            </div>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              We use the information we collect to operate, maintain, and provide the features and functionality of the CareHub platform. Specifically, we use it to:
            </p>
            <ul className="list-disc list-inside text-[hsl(var(--color-text-muted))] space-y-2 ml-2">
              <li>Power the <strong>AI Safety Engine</strong> to instantly flag drug interactions and allergies.</li>
              <li>Manage <strong>Live Queue Tracking</strong> to give patients real-time wait estimations.</li>
              <li>Enable seamless <strong>Cross-Clinic Access</strong> so doctors can view unified patient histories.</li>
              <li>Authenticate users using biometric data (Touch ID / Face ID) via hardware-level encryption.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-success)/0.1)] flex items-center justify-center">
                <LuServer className="w-5 h-5 text-[hsl(var(--color-success))]" />
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))]">3. Data Security & Encryption</h2>
            </div>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              CareHub treats medical data with military-grade security. <strong>100% of sensitive fields</strong> (such as patient phone numbers and medical IDs) are heavily encrypted at rest. Our Role-Based Access Control (RBAC) guarantees that a clinic assistant can never view a patient's private medical history—only the assigned doctor has decryption rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-4">4. Your Rights & Choices</h2>
            <p className="text-[hsl(var(--color-text-muted))] leading-relaxed mb-4">
              You have the right to access, update, or delete your personal information at any time through your account settings. If you wish to permanently close your account and remove your data from our active systems, please contact our support team.
            </p>
          </section>

          <hr className="border-[hsl(var(--color-border))]" />

          <p className="text-sm text-[hsl(var(--color-text-muted))] text-center">
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@carehub.com" className="text-[hsl(var(--color-primary))] hover:underline">privacy@carehub.com</a>.
          </p>

        </div>
      </div>
    </main>
  );
}
