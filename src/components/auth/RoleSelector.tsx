'use client';

interface RoleSelectorProps {
  selectedRole: 'doctor' | 'patient';
  onRoleChange: (role: 'doctor' | 'patient') => void;
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        type="button"
        onClick={() => onRoleChange('doctor')}
        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${
          selectedRole === 'doctor'
            ? 'bg-gradient-doctor text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        👨‍⚕️ Doctor
      </button>
      <button
        type="button"
        onClick={() => onRoleChange('patient')}
        className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all ${
          selectedRole === 'patient'
            ? 'bg-gradient-patient text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        👤 Patient
      </button>
    </div>
  );
}