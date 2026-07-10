"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { walletService } from "@/services/walletService";
import { LuImage } from "react-icons/lu";

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeRequestModal({ isOpen, onClose, onSuccess }: ChangeRequestModalProps) {
  const [setupMethod, setSetupMethod] = useState("instapay");
  const [setupDetails, setSetupDetails] = useState("");
  const [setupPhoto, setSetupPhoto] = useState<File | null>(null);
  const [setupPreview, setSetupPreview] = useState<string | null>(null);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSetupPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setSetupPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setSetupPhoto(null);
    setSetupPreview(null);
    setSetupDetails("");
    onClose();
  };

  const handleChangeRequestSubmit = async () => {
    if (!setupDetails) return toast.error("Please enter your new account details");
    if (!setupPhoto) return toast.error("Please upload a photo of yourself with your ID");

    setSetupSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("newPaymentMethod", setupMethod);
      formData.append("newAccountDetails", setupDetails);
      formData.append("idPhoto", setupPhoto);

      await walletService.requestPayoutChange(formData);
      toast.success("Change request submitted. An admin will review it.");
      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to request change");
    } finally {
      setSetupSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--color-bg-base)/0.6)] backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl p-8 w-full max-w-md shadow-[var(--shadow-xl)] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold tracking-tight text-[hsl(var(--color-text))] mb-2">Request Payout Change</h3>
        <p className="text-sm text-[hsl(var(--color-text-muted))] font-medium mb-6">
          For security, changing your payout destination requires admin approval.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-widest">New Payment Method</label>
            <select 
              value={setupMethod}
              onChange={e => setSetupMethod(e.target.value)}
              className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold text-[hsl(var(--color-text))]"
            >
              <option value="instapay">InstaPay</option>
              <option value="vodafone_cash">Vodafone Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-widest">New Account Details</label>
            <input 
              type="text"
              value={setupDetails}
              onChange={e => setSetupDetails(e.target.value)}
              className="w-full px-4 py-3 bg-[hsl(var(--color-bg-soft))] border border-[hsl(var(--color-border))] rounded-xl outline-none focus:border-[hsl(var(--color-primary))] font-bold text-[hsl(var(--color-text))]"
              placeholder={setupMethod === "instapay" ? "e.g., user@instapay" : "Phone / IBAN"}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5 uppercase tracking-widest">Selfie with ID (Required)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[hsl(var(--color-border-soft))] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[hsl(var(--color-bg-soft))] hover:border-[hsl(var(--color-primary))] transition-all relative overflow-hidden h-32 group"
            >
              {setupPreview ? (
                <img src={setupPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                    <LuImage className="text-2xl text-[hsl(var(--color-text-muted))] group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] text-center">Click to upload photo</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-[hsl(var(--color-border-soft))] text-sm font-bold text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleChangeRequestSubmit}
            disabled={setupSubmitting}
            className="flex-1 py-3 rounded-xl bg-[hsl(var(--color-text))] text-[hsl(var(--color-bg-base))] text-sm font-bold tracking-tight hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px"
          >
            {setupSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
