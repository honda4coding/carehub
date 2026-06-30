import { useEffect, useRef, useState } from "react";
import { LuCamera, LuX, LuRefreshCw } from "react-icons/lu";
import { useTranslations } from "next-intl";

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  title?: string;
}

export default function WebcamCapture({ onCapture, onClose, title = "Take Photo" }: WebcamCaptureProps) {
    const t = useTranslations("auto");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Keep track of the active stream to stop it reliably
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name !== "NotFoundError" && err.message !== "Requested device not found") {
        console.error("Camera access error:", err);
      }
      const msg = (err.name === "NotFoundError" || err.message === "Requested device not found") 
        ? "No camera device found on this system." 
        : "Failed to access camera. Please ensure you have granted permission.";
      setError(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            stopCamera();
            onCapture(file);
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl w-full max-w-2xl overflow-hidden border border-[hsl(var(--color-border))] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--color-border))]">
          <h3 className="text-lg font-black text-[hsl(var(--color-text))] flex items-center gap-2">
            <LuCamera className="text-primary" /> {title}
          </h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border-soft))] transition-colors">
            <LuX />
          </button>
        </div>
        
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {error ? (
            <div className="text-center p-6">
              <p className="text-red-400 font-semibold mb-4">{error}</p>
              <button onClick={startCamera} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors">
                <LuRefreshCw /> {t('tryAgain')}</button>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-4 flex justify-center bg-[hsl(var(--color-bg-soft))]">
          <button 
            disabled={!!error || !stream}
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center group-hover:scale-95 transition-transform">
              <LuCamera className="text-white text-xl" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
