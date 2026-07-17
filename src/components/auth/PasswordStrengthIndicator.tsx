import { LuCheck, LuX } from 'react-icons/lu';

export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const requirements = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One special character (@$!%*?&#)", valid: /[@$!%*?&#]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className="mt-2 flex flex-col gap-1.5 p-3 rounded-xl bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] animate-in fade-in zoom-in-95 duration-200">
      <p className="text-[10px] font-black text-[hsl(var(--color-text-muted))] mb-0.5 uppercase tracking-wider">Password Requirements</p>
      {requirements.map((req, idx) => (
        <div key={idx} className={`flex items-center gap-2 text-[12px] font-bold transition-colors ${req.valid ? 'text-[hsl(var(--color-success))]' : 'text-[hsl(var(--color-text-muted))]'}`}>
          {req.valid ? <LuCheck className="shrink-0 text-[14px]" /> : <LuX className="shrink-0 opacity-40 text-[14px]" />}
          <span className={req.valid ? "" : "opacity-70"}>{req.label}</span>
        </div>
      ))}
    </div>
  );
};
