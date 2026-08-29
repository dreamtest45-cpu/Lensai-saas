"use client";

import React from "react";
import { Download, ImageOff, Sparkles } from "lucide-react";

interface ResultDisplayProps {
  isLoading: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, generatedImageUrl, error }) => {
  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    try {
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "shelfshot-ai-result.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(generatedImageUrl, "_blank");
    }
  };

  return (
    <div className="bg-panel border border-line rounded-xl2 aspect-square flex items-center justify-center overflow-hidden relative">
      {isLoading && (
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-white/50">جاري توليد لقطة المنتج...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center space-y-2 px-8">
          <ImageOff className="mx-auto text-red-400" size={28} />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && generatedImageUrl && (
        <>
          <img src={generatedImageUrl} alt="Generated product shot" className="w-full h-full object-cover" />
          <button
            onClick={handleDownload}
            type="button"
            className="absolute bottom-4 left-4 bg-ink/80 backdrop-blur border border-line text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-ink transition-colors"
          >
            <Download size={16} />
            تحميل
          </button>
        </>
      )}

      {!isLoading && !error && !generatedImageUrl && (
        <div className="text-center space-y-2">
          <Sparkles className="mx-auto text-white/15" size={32} />
          <p className="text-sm text-white/30">ستظهر النتيجة هنا</p>
        </div>
      )}
    </div>
  );
};
