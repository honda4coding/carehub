import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal } from "./Modal";
import getCroppedImg from "@/utils/cropImage";
import { Button } from "./Button";
import { LuCheck, LuX } from "react-icons/lu";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (file: File) => void;
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Profile Picture">
      <div className="relative w-full h-80 bg-gray-900 rounded-xl overflow-hidden mb-4">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
        />
      </div>

      <div className="mb-6 px-2">
        <label className="text-sm font-medium text-slate-500 mb-2 block">
          Zoom
        </label>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
          <LuX className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isProcessing}>
          <LuCheck className="w-4 h-4 mr-2" />
          {isProcessing ? "Processing..." : "Apply"}
        </Button>
      </div>
    </Modal>
  );
}
