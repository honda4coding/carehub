"use client";
import { useEffect } from "react";


interface Props {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 end-4 z-50 flex items-center gap-2 bg-danger-light border border-red-200 text-red-700 text-[12px] font-bold px-4 py-3 rounded-xl">
      
      {message}
      <button onClick={onClose} className="ms-2 text-red-400 hover:text-danger">✕</button>
    </div>
  );
}
