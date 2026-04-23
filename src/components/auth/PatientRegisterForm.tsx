'use client';

import { useFormik } from 'formik';
import { patientRegisterSchema } from '@/components/schemas/patientRegisterSchema';
import { PatientFormValues } from '@/types/patient';
import { useState } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLock, MdCake, MdWc, MdBloodtype, MdLocationOn } from 'react-icons/md';

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

  const inputClasses = "w-full pl-10 pr-4 py-2 border border-[hsl(var(--color-text-muted)/0.3)] rounded-xl focus:ring-2 focus:ring-[hsl(var(--color-secondary))] focus:border-[hsl(var(--color-secondary))] transition-all outline-none bg-[hsl(var(--color-bg-white))] text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted)/0.6)]";
  const labelClasses = "block text-sm font-bold text-[hsl(var(--color-text))] mb-1.5 ml-1";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]";

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className={labelClasses}>
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdPerson className={iconClasses} />
          <input
            type="text"
            {...formik.getFieldProps('fullName')}
            className={inputClasses}
            placeholder="Enter full name"
          />
        </div>
        {formik.touched.fullName && formik.errors.fullName && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className={labelClasses}>
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MdEmail className={iconClasses} />
          <input
            type="email"
            {...formik.getFieldProps('email')}
            className={inputClasses}
            placeholder="patient@example.com"
          />
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.email}</p>
        )}
      </div>

      {/* Phone & Age - Grid for space efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Phone <span className="text-red-500">*</span></label>
          <div className="relative">
            <MdPhone className={iconClasses} />
            <input type="tel" {...formik.getFieldProps('phoneNumber')} className={inputClasses} placeholder="0123..." />
          </div>
          {formik.touched.phoneNumber && formik.errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.phoneNumber}</p>}
        </div>
        <div>
          <label className={labelClasses}>Age <span className="text-red-500">*</span></label>
          <div className="relative">
            <MdCake className={iconClasses} />
            <input type="number" {...formik.getFieldProps('age')} className={inputClasses} placeholder="35" />
          </div>
          {formik.touched.age && formik.errors.age && <p className="text-red-500 text-xs mt-1">{formik.errors.age}</p>}
        </div>
      </div>

      {/* Gender & Blood Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <label className={labelClasses}>Gender <span className="text-red-500">*</span></label>
          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                {...formik.getFieldProps('gender')}
                value="male"
                className="w-4 h-4 accent-[hsl(var(--color-secondary))] cursor-pointer"
              />
              <span className="text-sm font-medium text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-secondary))] transition-colors">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                {...formik.getFieldProps('gender')}
                value="female"
                className="w-4 h-4 accent-[hsl(var(--color-secondary))] cursor-pointer"
              />
              <span className="text-sm font-medium text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-secondary))] transition-colors">Female</span>
            </label>
          </div>
        </div>
        <div>
          <label className={labelClasses}>Blood Type (Optional)</label>
          <div className="relative">
            <MdBloodtype className={iconClasses} />
            <select {...formik.getFieldProps('bloodType')} className={`${inputClasses} appearance-none`}>
              <option value="">Select</option>
              {bloodTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <MdLock className={iconClasses} />
            <input type="password" {...formik.getFieldProps('password')} className={inputClasses} placeholder="********" />
          </div>
          {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>}
        </div>
        <div>
          <label className={labelClasses}>Confirm <span className="text-red-500">*</span></label>
          <div className="relative">
            <MdLock className={iconClasses} />
            <input type="password" {...formik.getFieldProps('confirmPassword')} className={inputClasses} placeholder="********" />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className={labelClasses}>Address (Optional)</label>
        <div className="relative">
          <MdLocationOn className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <textarea
            {...formik.getFieldProps('address')}
            rows={2}
            className={`${inputClasses} py-3`}
            placeholder="Enter your city and street"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-patient text-white font-bold py-4 rounded-xl transition-all hover:opacity-95 active:scale-[0.98] shadow-lg shadow-[hsl(var(--color-secondary)/0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating Sanctuary...
          </span>
        ) : (
          'Register as Patient'
        )}
      </button>
    </form>
  );
}