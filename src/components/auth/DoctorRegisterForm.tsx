'use client';

import { useFormik } from 'formik';
import { doctorRegisterSchema } from '@/components/schemas/doctorRegisterSchema';
import { DoctorFormValues } from '@/types/doctor';
import { useState } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLock, MdMedicalServices, MdBadge, MdLocationOn } from 'react-icons/md';
import { FaIdCard, FaFileUpload } from 'react-icons/fa';

const specialties = [
  { value: "general_practice", label: "General Practice" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "internal_medicine", label: "Internal Medicine" },
  { value: "neurology", label: "Neurology" },
  { value: "psychiatry", label: "Psychiatry" },
];

export default function DoctorRegisterForm() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik<DoctorFormValues>({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      nationalId: null,
      password: '',
      confirmPassword: '',
      specialty: '',
      syndicateId: 0,
      licenseImage: null,
      address: '',
    },
    validationSchema: doctorRegisterSchema,
    onSubmit: async (values) => {
      setLoading(true);
      console.log('Doctor Data:', values);
      setTimeout(() => {
        setLoading(false);
        alert('Doctor registered successfully!');
      }, 1000);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            {...formik.getFieldProps('fullName')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="Dr. Ahmed Mohamed"
          />
        </div>
        {formik.touched.fullName && formik.errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            {...formik.getFieldProps('email')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="doctor@clinic.com"
          />
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            {...formik.getFieldProps('phoneNumber')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="01234567890"
          />
        </div>
        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.phoneNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          National ID Image <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => formik.setFieldValue('nationalId', e.target.files?.[0] || null)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary cursor-pointer"
          />
        </div>
        <p className="text-gray-400 text-xs mt-1">JPG, PNG, PDF (max 5MB)</p>
        {formik.touched.nationalId && formik.errors.nationalId && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.nationalId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            {...formik.getFieldProps('password')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="********"
          />
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            {...formik.getFieldProps('confirmPassword')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="********"
          />
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Specialty <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdMedicalServices className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            {...formik.getFieldProps('specialty')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
          >
            <option value="">Select specialty</option>
            {specialties.map((spec) => (
              <option key={spec.value} value={spec.value}>{spec.label}</option>
            ))}
          </select>
        </div>
        {formik.touched.specialty && formik.errors.specialty && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.specialty}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Syndicate ID <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdBadge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            {...formik.getFieldProps('syndicateId')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="123456"
          />
        </div>
        {formik.touched.syndicateId && formik.errors.syndicateId && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.syndicateId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          License Image <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaFileUpload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => formik.setFieldValue('licenseImage', e.target.files?.[0] || null)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary cursor-pointer"
          />
        </div>
        <p className="text-gray-400 text-xs mt-1">JPG, PNG, PDF (max 5MB)</p>
        {formik.touched.licenseImage && formik.errors.licenseImage && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.licenseImage}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Address (Optional)
        </label>
        <div className="relative">
          <MdLocationOn className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            {...formik.getFieldProps('address')}
            rows={3}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="Full address"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-doctor text-white font-medium py-3 rounded-lg transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Registering...' : 'Register as Doctor'}
      </button>
    </form>
  );
}