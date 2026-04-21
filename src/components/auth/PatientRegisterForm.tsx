'use client';

import { useFormik } from 'formik';
import { patientRegisterSchema } from '@/components/schemas/patientRegisterSchema';
import { PatientFormValues } from '@/types/patient';
import { useState } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLock, MdCake, MdWc, MdBloodtype, MdLocationOn } from 'react-icons/md';
import { BiLastPage } from 'react-icons/bi';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientRegisterForm() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik<PatientFormValues>({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      age: 0,
      gender: 'male',
      bloodType: '',
      address: '',
    },
    validationSchema: patientRegisterSchema,
    onSubmit: async (values) => {
      setLoading(true);
      console.log('Patient Data:', values);
      setTimeout(() => {
        setLoading(false);
        alert('Patient registered successfully!');
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
            placeholder="Enter full name"
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
            placeholder="patient@example.com"
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
          Age <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <BiLastPage className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            {...formik.getFieldProps('age')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            placeholder="35"
          />
        </div>
        {formik.touched.age && formik.errors.age && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.age}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...formik.getFieldProps('gender')}
              value="male"
              className="w-4 h-4 accent-primary focus:ring-primary"
            />
            <span className="text-text-dark">Male</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...formik.getFieldProps('gender')}
              value="female"
              className="w-4 h-4 accent-primary focus:ring-primary"
            />
            <span className="text-text-dark">Female</span>
          </label>
        </div>
        {formik.touched.gender && formik.errors.gender && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.gender}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-1">
          Blood Type (Optional)
        </label>
        <div className="relative">
          <MdBloodtype className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            {...formik.getFieldProps('bloodType')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
          >
            <option value="">Select blood type</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
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
        className="w-full bg-gradient-patient text-white font-medium py-3 rounded-lg transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Registering...' : 'Register as Patient'}
      </button>
    </form>
  );
}