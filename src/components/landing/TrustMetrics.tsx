import { LuShieldCheck, LuLockKeyhole, LuFileBadge } from "react-icons/lu";

export default function TrustMetrics() {
  const metrics = [
    {
      icon: <LuLockKeyhole className="w-8 h-8" />,
      title: "Secure Authentication",
      desc: "All user sessions are protected using industry-standard JSON Web Tokens (JWT) and encrypted passwords.",
    },
    {
      icon: <LuShieldCheck className="w-8 h-8" />,
      title: "Role-Based Privacy",
      desc: "Strict separation of data. Patients only see their own records, and doctors only access the patients they treat.",
    },
    {
      icon: <LuFileBadge className="w-8 h-8" />,
      title: "Private Medical History",
      desc: "Your prescriptions, lab results, and vitals are securely stored in the cloud, accessible only by authorized personnel.",
    },
  ];

  return (
    <section className="w-full bg-[hsl(var(--color-bg-soft))] py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl lg:text-4xl font-black text-[hsl(var(--color-text))] tracking-tight mb-4">
            Security built into the code.
          </h2>
          <p className="text-lg text-[hsl(var(--color-text-muted))]">
            We prioritize data privacy through strong authentication and strict role-based access controls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <div 
              key={i} 
              className="bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-8 text-center border border-[hsl(var(--color-text-muted)/0.1)] hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[hsl(var(--color-primary))] text-white rounded-2xl shadow-lg shadow-[hsl(var(--color-primary)/0.2)]">
                {m.icon}
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-3">{m.title}</h3>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed max-w-sm mx-auto">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
