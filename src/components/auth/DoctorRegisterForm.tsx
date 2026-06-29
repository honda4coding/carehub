'use client';

import { useFormik } from 'formik';
import { doctorRegisterSchema } from '@/components/schemas/doctorRegisterSchema';
import { DoctorFormValues } from '@/types/doctor';
import { useState } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLock, MdMedicalServices, MdBadge, MdLocationOn } from 'react-icons/md';
import { FaIdCard, FaFileUpload } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('auth.RegisterForm');
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

        alert(t('registrationSuccess'));

      } catch (error) {
        alert(error instanceof Error ? error.message : t('connectionError'));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <Label>{t('fullNameLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="text" 
          {...formik.getFieldProps('fullName')} 
          placeholder={t('fullNamePlaceholderDoctor')} 
          leftIcon={<MdPerson className="w-5 h-5" />}
          error={!!(formik.touched.fullName && formik.errors.fullName)}
        />
        {formik.touched.fullName && formik.errors.fullName && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label>{t('emailLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="email" 
          {...formik.getFieldProps('email')} 
          placeholder={t('emailPlaceholderDoctor')} 
          leftIcon={<MdEmail className="w-5 h-5" />}
          error={!!(formik.touched.email && formik.errors.email)}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <Label>{t('phoneLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="tel" 
          {...formik.getFieldProps('phoneNumber')} 
          placeholder={t('phonePlaceholder')} 
          leftIcon={<MdPhone className="w-5 h-5" />}
          error={!!(formik.touched.phoneNumber && formik.errors.phoneNumber)}
        />
        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.phoneNumber}</p>
        )}
      </div>

      {/* National ID Upload */}
      <div>
        <Label>{t('nationalIdLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => formik.setFieldValue('nationalId', e.target.files?.[0] ?? null)}
          leftIcon={<FaIdCard className="w-5 h-5" />}
          error={!!(formik.touched.nationalId && formik.errors.nationalId)}
          className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[hsl(var(--color-primary)/0.1)] file:text-[hsl(var(--color-primary))] hover:file:bg-[hsl(var(--color-primary)/0.2)] cursor-pointer"
        />
        <p className="text-[hsl(var(--color-text-muted))] text-[10px] mt-1 ms-1 uppercase tracking-wider">{t('nationalIdHint')}</p>
        {formik.touched.nationalId && formik.errors.nationalId && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.nationalId}</p>
        )}
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t('passwordLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="password" 
            {...formik.getFieldProps('password')} 
            placeholder={t('passwordPlaceholder')} 
            leftIcon={<MdLock className="w-5 h-5" />}
            error={!!(formik.touched.password && formik.errors.password)}
          />
          {formik.touched.password && formik.errors.password && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.password}</p>}
        </div>
        <div>
          <Label>{t('confirmPasswordLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="password" 
            {...formik.getFieldProps('confirmPassword')} 
            placeholder={t('passwordPlaceholder')} 
            leftIcon={<MdLock className="w-5 h-5" />}
            error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Specialty */}
      <div>
        <Label>{t('specialtyLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <div className="relative">
          <MdMedicalServices className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <select 
            {...formik.getFieldProps('specialty')} 
            className={`w-full py-4 ps-12 pe-4 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] cursor-pointer appearance-none ${
              formik.touched.specialty && formik.errors.specialty 
              ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.05)] focus:ring-4 focus:ring-[hsl(var(--color-danger)/0.1)]'
              : 'border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]'
            }`}
          >
            <option value="">{t('selectSpecialty')}</option>
            {specialties.map((spec) => (
              <option key={spec.value} value={spec.value}>
                {t(`specialties.${spec.value}`)}
              </option>
            ))}
          </select>
        </div>
        {formik.touched.specialty && formik.errors.specialty && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.specialty}</p>
        )}
      </div>

      {/* Syndicate ID */}
      <div>
        <Label>{t('syndicateIdLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="number" 
          {...formik.getFieldProps('syndicateId')} 
          placeholder={t('syndicateIdPlaceholder')} 
          leftIcon={<MdBadge className="w-5 h-5" />}
          error={!!(formik.touched.syndicateId && formik.errors.syndicateId)}
        />
        {formik.touched.syndicateId && formik.errors.syndicateId && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.syndicateId}</p>
        )}
      </div>

      {/* License Image */}
      <div>
        <Label>{t('licenseImageLabel')} <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => formik.setFieldValue('licenseImage', e.target.files?.[0] ?? null)}
          leftIcon={<FaFileUpload className="w-5 h-5" />}
          error={!!(formik.touched.licenseImage && formik.errors.licenseImage)}
          className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[hsl(var(--color-primary)/0.1)] file:text-[hsl(var(--color-primary))] hover:file:bg-[hsl(var(--color-primary)/0.2)] cursor-pointer"
        />
        {formik.touched.licenseImage && formik.errors.licenseImage && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ms-1 font-bold">{formik.errors.licenseImage}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <Label>{t('addressLabel')}</Label>
        <div className="relative">
          <MdLocationOn className="absolute start-4 top-4 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <textarea 
            {...formik.getFieldProps('address')} 
            rows={2} 
            className="w-full py-4 ps-12 pe-4 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]" 
            placeholder={t('addressPlaceholderDoctor')} 
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-4 text-lg"
          isLoading={loading}
        >
          {t('submitDoctor')}
        </Button>
      </div>
    </form>
  );
}
