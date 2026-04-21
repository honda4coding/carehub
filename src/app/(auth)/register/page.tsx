'use client';

import { useState } from 'react';
import RoleSelector from '@/components/auth/RoleSelector';
import DoctorRegisterForm from '@/components/auth/DoctorRegisterForm';
import PatientRegisterForm from '@/components/auth/PatientRegisterForm';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'patient'>('doctor');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-bg">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-dark">
            Create New Account
          </h1>
          <p className="text-gray-500 mt-2">Register as Doctor or Patient</p>
        </div>

        <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

        {selectedRole === 'doctor' ? <DoctorRegisterForm /> : <PatientRegisterForm />}

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-gradient font-medium hover:opacity-80 transition">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}