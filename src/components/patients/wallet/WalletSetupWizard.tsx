"use client";

import { useState, useRef } from "react";
import { LuLock, LuClock, LuCircleX, LuImage } from "react-icons/lu";
import toast from "react-hot-toast";
import { walletService, PayoutProfile } from "@/services/walletService";
import { Card } from "@/components/ui/Card";

interface WalletSetupWizardProps {
  profile: PayoutProfile;
  onSetupComplete: () => void;
}

export default function WalletSetupWizard({ profile, onSetupComplete }: WalletSetupWizardProps) {
  const [setupMethod, setSetupMethod] = useState("instapay");
  const [setupDetails, setSetupDetails] = useState("");
  const [setupPhoto, setSetupPhoto] = useState<File | null>(null);
  const [setupPreview, setSetupPreview] = useState<string | null>(null);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSetupPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setSetupPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSetupSubmit = async () => {
    if (!setupDetails) return toast.error("Please enter your account details");
    if (!setupPhoto) return toast.error("Please upload a photo of yourself with your ID");

    setSetupSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", setupMethod);
      formData.append("accountDetails", setupDetails);
      formData.append("idPhoto", setupPhoto);

      await walletService.setupPayoutProfile(formData);
      toast.success("Wallet setup submitted successfully");
      onSetupComplete();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to setup profile");
    } finally {
      setSetupSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[hsl(var(--color-bg-base))] justify-center items-center p-4">
      <Card className="max-w-md w-full p-8 shadow-[var(--shadow-xl)] border-0">
        <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-2xl flex items-center justify-center mb-6 border border-[hsl(var(--color-primary)/0.2)]">
          <LuLock className="text-[hsl(var(--color-primary))] text-3xl" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--color-text))] mb-2">Secure Payout Setup</h1>
        <p className="text-sm text-[hsl(var(--color-text-muted))] font-medium mb-8">
          Before using your wallet for withdrawals, you must securely setup your payout details. These details will be locked to prevent unauthorized withdrawals.
        </p>

        {profile.hasPendingRequest ? (
          <div className="bg-[hsl(var(--color-warning)/0.1)] border border-[hsl(var(--color-warning)/0.2)] p-6 rounded-xl text-center shadow-sm">
            <LuClock className="text-[hsl(var(--color-warning))] text-4xl mx-auto mb-3" />
            <h3 className="text-base font-bold tracking-tight text-[hsl(var(--color-warning))] mb-2">Verification Pending</h3>
            <p className="text-sm text-[hsl(var(--color-text))] font-medium opacity-90">
              Your payout profile setup is currently being reviewed by our administration team. You will be able to access your wallet once approved.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {profile.lastRejectedReason && (
              <div className="bg-[hsl(var(--color-danger)/0.1)] border border-[hsl(var(--color-danger)/0.2)] p-4 rounded-xl text-[hsl(var(--color-danger))] text-sm font-bold shadow-sm">
                <p className="flex items-center gap-2 mb-1"><LuCircleX className="text-lg" /> Previous Request Rejected</p>
                <p className="font-medium opacity-90 pl-6">{profile.lastRejectedReason}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-widest">Payment Method</label>
              <select 
                value={setupMethod}
                onChange={e => setSetupMethod(e.target.value)}
                className="w-full px-4 py-3.5 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] font-bold text-[hsl(var(--color-text))] transition-all"
              >
                <option value="instapay">InstaPay</option>
                <option value="vodafone_cash">Vodafone Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-widest">Account Details</label>
              <input 
                type="text"
                value={setupDetails}
                onChange={e => setSetupDetails(e.target.value)}
                className="w-full px-4 py-3.5 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] font-bold text-[hsl(var(--color-text))] transition-all"
                placeholder={setupMethod === "instapay" ? "e.g., user@instapay" : "Phone / IBAN"}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-2 uppercase tracking-widest">Identity Verification</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[hsl(var(--color-border-soft))] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] hover:border-[hsl(var(--color-primary))] transition-all relative overflow-hidden group"
              >
                {setupPreview ? (
                  <img src={setupPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <LuImage className="text-[hsl(var(--color-text-muted))] text-4xl mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-[hsl(var(--color-text))] text-center leading-relaxed">Click to upload a clear photo of your face holding your National ID next to it.</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <button
              onClick={handleSetupSubmit}
              disabled={setupSubmitting}
              className="w-full py-4 mt-4 bg-[hsl(var(--color-primary))] hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-[15px] font-bold tracking-tight transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-px"
            >
              {setupSubmitting ? "Securing Profile..." : "Complete Setup & Unlock Wallet"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
