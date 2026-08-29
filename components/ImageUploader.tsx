"use client";

import React, { useRef } from "react";
import { ImageAsset } from "@/types";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  image: ImageAsset | null;
  onImageChange: (image: ImageAsset | null) => void;
  id: string;
  accept?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  image,
  onImageChange,
  id,
  accept = "image/*",
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange({
          file,
          preview: URL.createObjectURL(file),
          base64: reader.result as string,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/70 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
          image ? "border-amber-500/50 bg-white/5" : "border-line hover:border-amber-400 hover:bg-white/5"
        }`}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" id={id} />

        {image ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={image.preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md shadow-lg" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:bg-amber-500/20 transition-colors">
              {label.includes("لوغو") ? (
                <ImageIcon className="text-white/40 group-hover:text-amber-400" />
              ) : (
                <Upload className="text-white/40 group-hover:text-amber-400" />
              )}
            </div>
            <p className="text-sm text-white/50 group-hover:text-white/80">اضغط للرفع أو اسحب الصورة هنا</p>
            <p className="text-xs text-white/30">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
