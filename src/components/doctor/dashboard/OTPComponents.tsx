import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export const CountdownTimer = ({ targetTime }: { targetTime: number }) => {
    const t = useTranslations("auto");
  const [timeLeft, setTimeLeft] = useState(Math.max(0, targetTime - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, targetTime - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  if (timeLeft === 0) return <span className="text-[hsl(var(--color-danger))]">{t('expired')}</span>;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  return <span>{t('expiresIn')}{minutes}:{seconds.toString().padStart(2, '0')}</span>;
};

export const OTPInput = ({ length = 6, onComplete }: { length?: number, onComplete: (otp: string) => void }) => {
    const t = useTranslations("auto");
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    
    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasteData.length === length) {
      onComplete(pasteData);
    }
  };

  return (
    <div className="flex gap-2 justify-center mb-6" dir="ltr">
      {otp.map((value, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-black rounded-xl border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] focus:border-primary focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.2)] outline-none transition-all"
          placeholder="0"
        />
      ))}
    </div>
  );
};
