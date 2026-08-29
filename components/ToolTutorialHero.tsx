"use client";

import React, { useEffect, useState } from "react";
import { Wand2, Check } from "lucide-react";

// A silent, auto-looping mini walkthrough using real product photos:
// upload product + logo -> type prompt -> generate -> real result.

const PROMPT_TEXT = "علبة شوكولاته فاخرة مفتوحة بشريط ذهبي على خلفية بنية دافئة، إضاءة استوديو احترافية...";

type Stage = "idle" | "uploaded" | "typing" | "generating" | "result";

const STAGE_DURATIONS: Record<Stage, number> = {
  idle: 900,
  uploaded: 700,
  typing: 1800,
  generating: 1300,
  result: 2200,
};

const STAGE_ORDER: Stage[] = ["idle", "uploaded", "typing", "generating", "result"];

export const ToolTutorialHero: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const stage = STAGE_ORDER[stageIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setStageIndex((i) => (i + 1) % STAGE_ORDER.length);
    }, STAGE_DURATIONS[stage]);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "typing") {
      setTypedLength(0);
      return;
    }
    const interval = setInterval(() => {
      setTypedLength((n) => (n < PROMPT_TEXT.length ? n + 1 : n));
    }, 45);
    return () => clearInterval(interval);
  }, [stage]);

  const showResult = stage === "result";
  const isGenerating = stage === "generating";
  const hasProduct = stage !== "idle";

  return (
    <div className="relative rounded-xl2 overflow-hidden border border-line bg-panel aspect-square p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 opacity-70">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="text-[10px] text-white/30 ms-2">shelfshotai.com/dashboard</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        <div
          className={`relative rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-colors duration-500 ${
            hasProduct ? "border-amber-500/50 bg-white/5" : "border-line"
          }`}
        >
          {!hasProduct ? (
            <span className="text-white/25 text-[11px]">اسحب صورة المنتج هنا</span>
          ) : (
            <div className="relative w-full h-full scale-in">
              <img
                src="/demo-product.jpg"
                alt="صورة المنتج الأصلية"
                className="w-full h-full object-cover"
              />
              <img
                src="/demo-logo.png"
                alt="لوغو"
                className="absolute bottom-2 right-2 w-10 h-auto rounded shadow-lg bg-[#2b0f1f]/80 p-1"
              />
            </div>
          )}
        </div>

        <div className="relative rounded-xl border border-line overflow-hidden flex items-center justify-center bg-[#15171C]">
          {isGenerating && (
            <div className="w-6 h-6 border-2 border-white/15 border-t-amber-500 rounded-full animate-spin" />
          )}
          {showResult && (
            <div className="absolute inset-0 fade-in">
              <img
                src="/demo-result.jpg"
                alt="النتيجة الاحترافية"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-emerald-500/90 text-ink text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check size={10} strokeWidth={3} /> تم
              </span>
            </div>
          )}
          {!isGenerating && !showResult && (
            <span className="text-white/10 text-[11px]">ستظهر النتيجة هنا</span>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-ink border border-line px-3 py-2.5 text-[11px] text-white/60 h-9 flex items-center overflow-hidden whitespace-nowrap">
        {stage === "typing" || stage === "generating" || stage === "result"
          ? PROMPT_TEXT.slice(0, stage === "typing" ? typedLength : PROMPT_TEXT.length)
          : ""}
        {stage === "typing" && <span className="inline-block w-[2px] h-3 bg-amber-400 ms-0.5 animate-pulse" />}
      </div>

      <div
        className={`rounded-lg py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
          isGenerating || showResult
            ? "bg-gradient-to-l from-amber-500 to-orange-600 text-ink"
            : "bg-white/5 text-white/30"
        } ${isGenerating ? "scale-95" : "scale-100"}`}
      >
        <Wand2 size={13} />
        توليد الصورة
      </div>

      <style jsx>{`
        .scale-in {
          animation: scaleIn 0.4s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0.3); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
