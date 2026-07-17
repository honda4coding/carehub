"use client";

interface Props {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-danger-light border border-red-200 text-red-700 text-[12px] font-bold px-4 py-3 rounded-xl shadow-lg">
      {message}
      <button onClick={onClose} className="ml-2 text-red-400 hover:text-danger font-bold transition-colors">✕</button>
    </div>
  );
}
