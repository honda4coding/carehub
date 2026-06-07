'use client';

import { useFormik } from 'formik';
import { doctorRegisterSchema } from '@/components/schemas/doctorRegisterSchema';
import { DoctorFormValues } from '@/types/doctor';
import { useState } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLock, MdMedicalServices, MdBadge, MdLocationOn } from 'react-icons/md';
import { FaIdCard, FaFileUpload } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

async function parseErrorMessage(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const json = JSON.parse(raw);
    return json.message || "Something went wrong";
  } catch {
    return raw || "Something went wrong";
  }
}

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
      try {
        const formData = new FormData();
        formData.append("fullName", values.fullName);
        formData.append("email", values.email);
        formData.append("phoneNumber", values.phoneNumber);
        formData.append("password", values.password);
        formData.append("confirmPassword", values.confirmPassword);
        formData.append("specialty", values.specialty);
        formData.append("syndicateId", values.syndicateId.toString());
        formData.append("role", "doctor");
        if (values.address) formData.append("address", values.address);
        if (values.licenseImage) formData.append("licenseImage", values.licenseImage);
        if (values.nationalId) formData.append("nationalId", values.nationalId);

        const res = await fetch(`${BASE_URL}/users/signup`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const message = await parseErrorMessage(res);
          throw new Error(message);
        }

        alert("Registration submitted successfully! Awaiting admin approval.");

      } catch (error) {
        alert(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  const inputClasses = "w-full pl-10 pr-4 py-2 border border-[hsl(var(--color-text-muted)/0.3)] rounded-xl focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-[hsl(var(--color-primary))] transition-all outline-none bg-[hsl(var(--color-bg-white))] text-[hsl(var(--color-text))] placeholder-[hsl(var(--color-text-muted)/0.6)]";
  const labelClasses = "block text-sm font-bold text-[hsl(var(--color-text))] mb-1.5 ml-1";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]";

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className={labelClasses}>Full Name <span className="text-red-500">*</span></label>
        <div className="relative">
          <MdPerson className={iconClasses} />
          <input type="text" {...formik.getFieldProps('fullName')} className={inputClasses} placeholder="Dr. Ahmed Mohamed" />
        </div>
        {formik.touched.fullName && formik.errors.fullName && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className={labelClasses}>Email <span className="text-red-500">*</span></label>
        <div className="relative">
          <MdEmail className={iconClasses} />
          <input type="email" {...formik.getFieldProps('email')} className={inputClasses} placeholder="doctor@clinic.com" />
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className={labelClasses}>Phone Number <span className="text-red-500">*</span></label>
        <div className="relative">
          <MdPhone className={iconClasses} />
          <input type="tel" {...formik.getFieldProps('phoneNumber')} className={inputClasses} placeholder="01234567890" />
        </div>
        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.phoneNumber}</p>
        )}
      </div>

      {/* National ID Upload */}
      <div>
        <label className={labelClasses}>National ID Image <span className="text-red-500">*</span></label>
        <div className="relative">
          <FaIdCard className={iconClasses} />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => formik.setFieldValue('nationalId', e.target.files?.[0] ?? null)}
            className={`${inputClasses} file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[hsl(var(--color-badge-bg))] file:text-[hsl(var(--color-badge-text))] hover:file:bg-[hsl(var(--color-primary)/0.2)] cursor-pointer`}
          />
        </div>
        <p className="text-[hsl(var(--color-text-muted))] text-[10px] mt-1 ml-1 uppercase tracking-wider">JPG, PNG, PDF (Max 5MB)</p>
        {formik.touched.nationalId && formik.errors.nationalId && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.nationalId}</p>
        )}
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

      {/* Specialty */}
      <div>
        <label className={labelClasses}>Specialty <span className="text-red-500">*</span></label>
        <div className="relative">
          <MdMedicalServices className={iconClasses} />
          <select {...formik.getFieldProps('specialty')} className={`${inputClasses} appearance-none cursor-pointer`}>
            <option value="">Select specialty</option>
            {specialties.map((spec) => (
              <option key={spec.value} value={spec.value}>{spec.label}</option>
            ))}
          </select>
        </div>
        {formik.touched.specialty && formik.errors.specialty && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.specialty}</p>
        )}
      </div>

      {/* Syndicate ID */}
      <div>
        <label className={labelClasses}>Syndicate ID <span className="text-red-500">*</span></label>
        <div className="relative">
          <MdBadge className={iconClasses} />
          <input type="number" {...formik.getFieldProps('syndicateId')} className={inputClasses} placeholder="123456" />
        </div>
        {formik.touched.syndicateId && formik.errors.syndicateId && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.syndicateId}</p>
        )}
      </div>

      {/* License Image */}
      <div>
        <label className={labelClasses}>License Image <span className="text-red-500">*</span></label>
        <div className="relative">
          <FaFileUpload className={iconClasses} />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => formik.setFieldValue('licenseImage', e.target.files?.[0] ?? null)}
            className={`${inputClasses} file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[hsl(var(--color-badge-bg))] file:text-[hsl(var(--color-badge-text))] hover:file:bg-[hsl(var(--color-primary)/0.2)] cursor-pointer`}
          />
        </div>
        {formik.touched.licenseImage && formik.errors.licenseImage && (
          <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.licenseImage}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className={labelClasses}>Address (Optional)</label>
        <div className="relative">
          <MdLocationOn className="absolute left-3 top-3 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <textarea {...formik.getFieldProps('address')} rows={2} className={`${inputClasses} py-3`} placeholder="Clinic or Hospital address" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-doctor text-white font-bold py-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[hsl(var(--color-primary)/0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <ImSpinner2 className="animate-spin h-5 w-5 text-white" />
            Processing...
          </span>
        ) : (
          'Complete Registration'
        )}
      </button>
    </form>
  );
}
