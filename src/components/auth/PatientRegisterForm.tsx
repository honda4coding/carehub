'use client';

import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { patientRegisterSchema } from '@/components/schemas/patientRegisterSchema';
import { PatientFormValues } from '@/types/patient';
import { useState } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLock, MdCake, MdBloodtype, MdLocationOn } from 'react-icons/md';
import { ImSpinner2 } from 'react-icons/im';
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

async function parseErrorMessage(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const json = JSON.parse(raw);
    return json.message || "Something went wrong";
  } catch {
    return raw || "Something went wrong";
  }
}

export default function PatientRegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
      try {
        const payload: any = { ...values, role: "patient" };
        if (!payload.address) delete payload.address;
        if (!payload.bloodType) delete payload.bloodType;

        const res = await fetch(`${BASE_URL}/users/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const message = await parseErrorMessage(res);
          throw new Error(message);
        }

        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=confirm`);

      } catch (error) {
        alert(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <Label>Full Name <span className="text-[hsl(var(--color-danger))]">*</span></Label>
        <Input 
          type="text" 
          {...formik.getFieldProps('fullName')} 
          placeholder="Enter full name" 
          leftIcon={<MdPerson className="w-5 h-5" />}
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
          leftIcon={<MdEmail className="w-5 h-5" />}
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
            placeholder="0123..." 
            leftIcon={<MdPhone className="w-5 h-5" />}
            error={!!(formik.touched.phoneNumber && formik.errors.phoneNumber)}
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.phoneNumber}</p>}
        </div>
        <div>
          <Label>Age <span className="text-[hsl(var(--color-danger))]">*</span></Label>
          <Input 
            type="number" 
            {...formik.getFieldProps('age')} 
            placeholder="35" 
            leftIcon={<MdCake className="w-5 h-5" />}
            error={!!(formik.touched.age && formik.errors.age)}
          />
          {formik.touched.age && formik.errors.age && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.age}</p>}
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
            <MdBloodtype className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
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
            placeholder="********" 
            leftIcon={<MdLock className="w-5 h-5" />}
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
            leftIcon={<MdLock className="w-5 h-5" />}
            error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-[hsl(var(--color-danger))] text-xs mt-1 font-bold">{formik.errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <Label>Address (Optional)</Label>
        <div className="relative">
          <MdLocationOn className="absolute left-4 top-4 w-5 h-5 text-[hsl(var(--color-text-muted))]" />
          <textarea 
            {...formik.getFieldProps('address')} 
            rows={2} 
            className="w-full py-4 pl-12 pr-4 rounded-2xl outline-none transition-all bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)]" 
            placeholder="Enter your city and street" 
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
          Register as Patient
        </Button>
      </div>
    </form>
  );
}
