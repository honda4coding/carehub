"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { LuZoomIn, LuZoomOut } from "react-icons/lu";
import getCroppedImg from "@/utils/cropImage";

interface ImageCropperModalProps {
  imageSrc: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  imageSrc,
  onConfirm,
  onCancel,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedFile) {
        onConfirm(croppedFile);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-in fade-in duration-200">
      <div className="bg-[hsl(var(--color-bg-base))] p-5 rounded-2xl w-full max-w-md shadow-xl m-4 flex flex-col relative animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-black text-[hsl(var(--color-text))] mb-4 text-center">
          Adjust Profile Picture
        </h3>

        <div className="relative w-full h-[300px] bg-black rounded-xl overflow-hidden mb-5">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="flex items-center gap-3 mb-6 px-2">
          <LuZoomOut className="text-[hsl(var(--color-text-muted))]" />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-[hsl(var(--color-border))] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--color-primary))]"
          />
          <LuZoomIn className="text-[hsl(var(--color-text-muted))]" />
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-border))] hover:text-[hsl(var(--color-text))] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[hsl(var(--color-primary))] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Save Picture"}
          </button>
        </div>
      </div>
    </div>
  );
}
