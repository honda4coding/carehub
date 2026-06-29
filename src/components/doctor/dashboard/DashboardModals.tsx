import { LuShieldCheck, LuX, LuSmartphone, LuUserPlus, LuCheck } from "react-icons/lu";
import { OTPInput } from "./OTPComponents";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

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
  walkInAge,
  setWalkInAge,
  handleWalkInRegister,
}: any) => {
  const t = useTranslations("doctor.dashboard.modals");
  return (
    <>
      {/* OTP Verification Modal */}
      {isOTPModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-primary">
                <LuShieldCheck className="text-xl" />
                <h3 className="font-black text-[hsl(var(--color-text))]">{t("secureAccess")}</h3>
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
                <h4 className="text-lg font-black text-[hsl(var(--color-text))]">{t("enterOtp")}</h4>
                <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mt-1">
                  {t("otpDescription")}
                </p>
              </div>
              
              <OTPInput 
                length={6} 
                onComplete={(val) => setCurrentOtp(val)} 
              />

              <Button 
                onClick={handleVerifyOTP}
                disabled={currentOtp.length !== 6}
                className="w-full !rounded-xl !py-3.5 mt-2"
                icon={LuCheck}
                iconPosition="right"
              >
                {t("verifyBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-In Registration Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
                <LuUserPlus className="text-[18px]" />
                <h3 className="font-black text-[hsl(var(--color-text))] text-[15px]">{t("walkInTitle")}</h3>
              </div>
              <button onClick={() => setWalkInModalOpen(false)} className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors cursor-pointer">
                <LuX className="text-[18px]" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-5">
                {t("walkInDescription")}
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">{t("patientName")}</label>
                  <input 
                    type="text" 
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                    placeholder={t("patientNamePlaceholder")} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">{t("phoneNumber")}</label>
                    <input 
                      type="tel" 
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                      placeholder="010..." 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">{t("ageOptional")}</label>
                    <input 
                      type="number" 
                      value={walkInAge}
                      onChange={(e) => setWalkInAge(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                      placeholder="e.g. 25" 
                      min="0"
                      max="120"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleWalkInRegister}
                disabled={!walkInName.trim() || !walkInPhone.trim()}
                className="w-full !rounded-xl !py-3.5 mt-2"
                icon={LuCheck}
                iconPosition="right"
              >
                {t("startSessionBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
