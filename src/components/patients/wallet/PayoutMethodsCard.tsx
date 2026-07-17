"use client";

import { LuLock, LuPen } from "react-icons/lu";
import { PayoutProfile } from "@/services/walletService";

interface PayoutMethodsCardProps {
  payoutMethods: any[];
  profile: PayoutProfile | null;
  onAddMethod: () => void;
}

export default function PayoutMethodsCard({ payoutMethods, profile, onAddMethod }: PayoutMethodsCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-[hsl(var(--color-text))]">Approved Payment Methods</h3>
        <button 
          onClick={onAddMethod}
          className="px-4 py-2 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] border border-[hsl(var(--color-primary)/0.2)] rounded-lg text-xs font-bold hover:bg-[hsl(var(--color-primary)/0.2)] transition-colors shadow-sm"
        >
          + Add New Method
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payoutMethods.length > 0 ? (
          payoutMethods.map(method => (
            <div key={method._id} className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col justify-between shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--color-primary))] group-hover:w-1.5 transition-all"></div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
                  {method.methodType.replace(/_/g, ' ')}
                </p>
                <div className="w-8 h-8 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center">
                  <LuLock />
                </div>
              </div>
              <div className="flex justify-between items-end mt-2">
                <p className="text-sm font-bold tracking-wide text-[hsl(var(--color-text))]">{method.accountDetails}</p>
                <button 
                  onClick={onAddMethod}
                  className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors p-1"
                  title="Edit Method"
                >
                  <LuPen size={16} />
                </button>
              </div>
            </div>
          ))
        ) : profile?.paymentMethod ? (
          <div className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl p-5 flex flex-col justify-between shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-px relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--color-primary))] group-hover:w-1.5 transition-all"></div>
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
                {profile.paymentMethod.replace(/_/g, ' ')}
              </p>
              <div className="w-8 h-8 bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] rounded-lg flex items-center justify-center">
                <LuLock />
              </div>
            </div>
            <div className="flex justify-between items-end mt-2">
              <p className="text-sm font-bold tracking-wide text-[hsl(var(--color-text))]">{profile.accountDetails}</p>
              <button 
                onClick={onAddMethod}
                className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors p-1"
                title="Edit Method"
              >
                <LuEdit size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[hsl(var(--color-text-muted))] text-sm font-medium">No approved payment methods yet.</p>
        )}
      </div>
    </div>
  );
}
