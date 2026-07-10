'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { patientRegisterSchema } from '@/components/schemas/patientRegisterSchema';
import { PatientFormValues } from '@/types/patient';
import { useState } from 'react';
import { LuUser, LuMail, LuPhone, LuLock, LuCake, LuDroplet, LuMapPin } from 'react-icons/lu';
import { LuLoader } from 'react-icons/lu';
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { fetchClient } from "@/services/fetchClient";

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const egyptianGovernorates = [
    "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira",
    "Fayoum", "Gharbia", "Ismailia", "Menofia", "Minya", "Qaliubiya",
    "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena",
    "Sharqia", "South Sinai", "Suez", "Aswan", "Asyut", "Beni Suef",
    "Damietta", "Kafr El Sheikh", "Matruh", "Luxor", "Sohag"
];


export default function PatientRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const formik = useFormik<PatientFormValues>({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: 'male',
      bloodType: '',
      governorate: '',
      address: '',
    },
    validationSchema: patientRegisterSchema,
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
        formData.append("dateOfBirth", values.dateOfBirth);
        formData.append("gender", values.gender);
        formData.append("role", "patient");
        formData.append("governorate", values.governorate);
        if (values.address) formData.append("address", values.address);
        if (values.bloodType) formData.append("bloodType", values.bloodType);

        await fetchClient.post("/users/signup", formData);

        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=confirm`);

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
          placeholder="e.g. Ahmed Ali" 
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
          placeholder="patient@example.com" 
          leftIcon={<LuMail className="w-5 h-5" />}
          error={!!(formik.touched.email && formik.errors.email)}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-[hsl(var(--color-danger))] text-xs mt-1 ml-1 font-bold">{formik.errors.email}</p>
        )}
      </div>

      {/* Phone & Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Phone <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="tel" 
            {...formik.getFieldProps('phoneNumber')} 
            placeholder="e.g. 01012345678" 
            leftIcon={<LuPhone className="w-5 h-5" />}
            error={!!(formik.touched.phoneNumber && formik.errors.phoneNumber)}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.phoneNumber}</p>}
        </div>
        {/* Date of Birth */}
        <div>
          <Label>Date of Birth <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="date" 
            {...formik.getFieldProps('dateOfBirth')} 
            leftIcon={<LuCake className="w-5 h-5" />}
            error={!!(formik.touched.dateOfBirth && formik.errors.dateOfBirth)}
            max={new Date().toISOString().split('T')[0]}
          />
          {formik.touched.dateOfBirth && formik.errors.dateOfBirth && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.dateOfBirth}</p>}
        </div>
      </div>

      {/* Gender & Blood Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <Label>Gender <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" {...formik.getFieldProps('gender')} value="male" className="w-4 h-4 accent-[hsl(var(--color-primary))] cursor-pointer" />
              <span className="text-sm font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" {...formik.getFieldProps('gender')} value="female" className="w-4 h-4 accent-[hsl(var(--color-primary))] cursor-pointer" />
              <span className="text-sm font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">Female</span>
            </label>
          </div>
        </div>
        <div>
          <Label>Blood Type (Optional)</Label>
          <div className="relative">
            <LuDroplet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
            <select 
              {...formik.getFieldProps('bloodType')} 
              className={`w-full py-4 pl-12 pr-4 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] cursor-pointer appearance-none ${
                formik.touched.bloodType && formik.errors.bloodType 
                ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.05)] focus:ring-4 focus:ring-[hsl(var(--color-danger)/0.1)]'
                : 'border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]'
              }`}
            >
              <option value="">Select</option>
              {bloodTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Password <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="password" 
            {...formik.getFieldProps('password')} 
            placeholder="••••••••" 
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
            placeholder="••••••••" 
            leftIcon={<LuLock className="w-5 h-5" />}
            error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Governorate */}
      <div>
        <Label>Governorate <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <div className="relative">
          <LuMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <select 
            {...formik.getFieldProps('governorate')} 
            className={`w-full py-4 pl-12 pr-10 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] cursor-pointer appearance-none ${
              formik.touched.governorate && formik.errors.governorate 
              ? 'border-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.05)] focus:ring-4 focus:ring-[hsl(var(--color-danger)/0.1)]'
              : 'border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]'
            }`}
          >
            <option value="">Select Governorate</option>
            {egyptianGovernorates.map((gov) => <option key={gov} value={gov}>{gov}</option>)}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--color-text-muted))]">▾</span>
        </div>
        {formik.touched.governorate && formik.errors.governorate && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.governorate}</p>}
      </div>

      {/* Address */}
      <div>
        <Label>Address (Optional)</Label>
        <Input 
          type="text" 
          {...formik.getFieldProps('address')} 
          placeholder="Enter your city and street" 
          leftIcon={<LuMapPin className="w-5 h-5" />}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 text-lg"
          isLoading={loading}
        >
          Register as Patient
        </Button>
      </div>
    </form>
  );
}


