import { LuShieldCheck, LuX, LuSmartphone, LuUserPlus, LuCheck } from "react-icons/lu";
import { OTPInput } from "./OTPComponents";

export const DashboardModals = ({
  isOTPModalOpen,
  setOTPModalOpen,
  isWalkInModalOpen,
  setWalkInModalOpen,
  currentOtp,
  setCurrentOtp,
  handleVerifyOTP,
  walkInName,
  setWalkInName,
  walkInPhone,
  setWalkInPhone,
  handleWalkInRegister,
}: any) => {
  return (
    <>
      {/* OTP Verification Modal */}
      {isOTPModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-primary">
                <LuShieldCheck className="text-xl" />
                <h3 className="font-black text-[hsl(var(--color-text))]">Secure Access Handshake</h3>
              </div>
              <button onClick={() => setOTPModalOpen(false)} className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors">
                <LuX className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                   <LuSmartphone className="text-3xl text-primary" />
                </div>
                <h4 className="text-lg font-black text-[hsl(var(--color-text))]">Enter Patient OTP</h4>
                <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mt-1">
                  We've sent a 6-digit code to the patient. Ask them for the code to securely access their file.
                </p>
              </div>
              
              <OTPInput 
                length={6} 
                onComplete={(val) => setCurrentOtp(val)} 
              />

              <button 
                onClick={handleVerifyOTP}
                disabled={currentOtp.length !== 6}
                className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-opacity shadow-[0_4px_12px_hsl(var(--color-primary)/0.25)] ${currentOtp.length === 6 ? 'bg-primary hover:opacity-90' : 'bg-primary/50 cursor-not-allowed'}`}
              >
                Verify & Open File
                <LuCheck className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-In Registration Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-gradient-doctor">
              <div className="flex items-center gap-2 text-white">
                <LuUserPlus className="text-xl" />
                <h3 className="font-black">Walk-in Patient</h3>
              </div>
              <button onClick={() => setWalkInModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <LuX className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-5">
                Register a quick session for an offline patient. They won't need to verify an OTP.
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Patient Name</label>
                  <input 
                    type="text" 
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                    placeholder="e.g. Ahmed Ali" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                    placeholder="010..." 
                  />
                </div>
              </div>

              <button 
                onClick={handleWalkInRegister}
                disabled={!walkInName.trim() || !walkInPhone.trim()}
                className={`w-full text-[hsl(var(--color-bg-surface))] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-opacity ${walkInName.trim() && walkInPhone.trim() ? 'bg-[hsl(var(--color-text))] hover:opacity-90' : 'bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] cursor-not-allowed'}`}
              >
                Start Consultation Session
                <LuCheck className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
