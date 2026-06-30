'use client';
import { LuUser, LuHeart } from "react-icons/lu";
import { useTranslations } from 'next-intl';

interface RoleSelectorProps {
  selectedRole: 'doctor' | 'patient';
  onRoleChange: (role: 'doctor' | 'patient') => void;
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const t = useTranslations('auth.RoleSelector');
  
  return (
    <div className="mb-10">
      <label className="block text-center text-xs font-bold tracking-widest uppercase text-[hsl(var(--color-text-muted))] mb-6">
        {t('title')}
      </label>
      <div
        className="flex p-1.5 rounded-full w-full max-w-sm mx-auto"
        style={{ backgroundColor: "hsl(var(--color-bg-soft))" }}
      >
        <button
          type="button"
          onClick={() => onRoleChange('doctor')}
          className="flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
          style={
            selectedRole === "doctor"
              ? {
                  background: "white",
                  color: "hsl(var(--color-primary-strong))",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }
              : { color: "hsl(var(--color-text-muted))" }
          }
        >
          <LuHeart className="w-4 h-4" />
          {t('doctor')}
        </button>

        <button
          type="button"
          onClick={() => onRoleChange('patient')}
          className="flex-1 py-3 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300"
          style={
            selectedRole === "patient"
              ? {
                  background: "white",
                  color: "hsl(var(--color-primary-strong))",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }
              : { color: "hsl(var(--color-text-muted))" }
          }
        >
          <LuUser className="w-4 h-4" />
          {t('patient')}
        </button>
      </div>
    </div>
  );
}