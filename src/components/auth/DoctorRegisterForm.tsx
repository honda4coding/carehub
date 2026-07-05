'use client';

import { useFormik } from 'formik';
import { doctorRegisterSchema } from '@/components/schemas/doctorRegisterSchema';
import { DoctorFormValues } from '@/types/doctor';
import { useState } from 'react';
import { LuUser, LuMail, LuPhone, LuLock, LuActivity, LuBadge, LuMapPin } from 'react-icons/lu';
import { LuIdCard, LuUpload } from 'react-icons/lu';
import { LuLoader } from 'react-icons/lu';
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

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
    if (json.message === "validation error" && Array.isArray(json.error)) {
      return json.error.map((e: any) => e.message).join(", ");
    }
    return json.message || "Something went wrong";
  } catch {
    return raw || "Something went wrong";
  }
}

export default function DoctorRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
        setSubmitError("");
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
        setSubmitError(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 rounded-xl bg-[hsl(var(--color-danger-bg))] border border-[hsl(var(--color-danger))/20] text-[hsl(var(--color-danger))] text-sm font-semibold mb-4">
          {submitError}
        </div>
      )}
      {/* Full Name */}
      <div>
        <Label>Full Name <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="text" 
          {...formik.getFieldProps('fullName')} 
          placeholder="Dr. Ahmed Mohamed" 
          leftIcon={<LuUser className="w-5 h-5" />}
          error={!!(formik.touched.fullName && formik.errors.fullName)}
        />
        {formik.touched.fullName && formik.errors.fullName && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label>Email <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="email" 
          {...formik.getFieldProps('email')} 
          placeholder="doctor@clinic.com" 
          leftIcon={<LuMail className="w-5 h-5" />}
          error={!!(formik.touched.email && formik.errors.email)}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <Label>Phone Number <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="tel" 
          {...formik.getFieldProps('phoneNumber')} 
          placeholder="01234567890" 
          leftIcon={<LuPhone className="w-5 h-5" />}
          error={!!(formik.touched.phoneNumber && formik.errors.phoneNumber)}
        />
        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.phoneNumber}</p>
        )}
      </div>

      {/* National ID Upload */}
      <div>
        <Label>National ID Image <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => formik.setFieldValue('nationalId', e.target.files?.[0] ?? null)}
          leftIcon={<LuIdCard className="w-5 h-5" />}
          error={!!(formik.touched.nationalId && formik.errors.nationalId)}
          className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[hsl(var(--color-primary)/0.1)] file:text-[hsl(var(--color-primary))] hover:file:bg-[hsl(var(--color-primary)/0.2)] cursor-pointer"
        />
        <p className="text-[hsl(var(--color-text-muted))] text-[10px] mt-1 ml-1 uppercase tracking-wider">JPG, PNG, PDF (Max 5MB)</p>
        {formik.touched.nationalId && formik.errors.nationalId && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.nationalId}</p>
        )}
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Password <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="password" 
            {...formik.getFieldProps('password')} 
            placeholder="********" 
            leftIcon={<LuLock className="w-5 h-5" />}
            error={!!(formik.touched.password && formik.errors.password)}
          />
          {formik.touched.password && formik.errors.password && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.password}</p>}
        </div>
        <div>
          <Label>Confirm <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="password" 
            {...formik.getFieldProps('confirmPassword')} 
            placeholder="********" 
            leftIcon={<LuLock className="w-5 h-5" />}
            error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Specialty */}
      <div>
        <Label>Specialty <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <div className="relative">
          <LuActivity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <select 
            {...formik.getFieldProps('specialty')} 
            className={`w-full py-4 pl-12 pr-4 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] cursor-pointer appearance-none ${
              formik.touched.specialty && formik.errors.specialty 
              ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.05)] focus:ring-4 focus:ring-[hsl(var(--color-danger)/0.1)]'
              : 'border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]'
            }`}
          >
            <option value="">Select specialty</option>
            {specialties.map((spec) => (
              <option key={spec.value} value={spec.value}>{spec.label}</option>
            ))}
          </select>
        </div>
        {formik.touched.specialty && formik.errors.specialty && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.specialty}</p>
        )}
      </div>

      {/* Syndicate ID */}
      <div>
        <Label>Syndicate ID <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="number" 
          {...formik.getFieldProps('syndicateId')} 
          placeholder="123456" 
          leftIcon={<LuBadge className="w-5 h-5" />}
          error={!!(formik.touched.syndicateId && formik.errors.syndicateId)}
        />
        {formik.touched.syndicateId && formik.errors.syndicateId && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.syndicateId}</p>
        )}
      </div>

      {/* License Image */}
      <div>
        <Label>License Image <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => formik.setFieldValue('licenseImage', e.target.files?.[0] ?? null)}
          leftIcon={<LuUpload className="w-5 h-5" />}
          error={!!(formik.touched.licenseImage && formik.errors.licenseImage)}
          className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[hsl(var(--color-primary)/0.1)] file:text-[hsl(var(--color-primary))] hover:file:bg-[hsl(var(--color-primary)/0.2)] cursor-pointer"
        />
        {formik.touched.licenseImage && formik.errors.licenseImage && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.licenseImage}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <Label>Address (Optional)</Label>
        <div className="relative">
          <LuMapPin className="absolute left-4 top-4 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <textarea 
            {...formik.getFieldProps('address')} 
            rows={2} 
            className="w-full py-4 pl-12 pr-4 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]" 
            placeholder="Clinic or Hospital address" 
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
          Complete Registration
        </Button>
      </div>
    </form>
  );
}


