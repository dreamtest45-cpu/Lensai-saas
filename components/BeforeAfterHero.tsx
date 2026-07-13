"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";

// Interactive + auto-animated before/after reveal for the hero section.
// Auto-slides back and forth to draw attention; visitors can also drag it manually.
export const BeforeAfterHero: React.FC = () => {
  const [position, setPosition] = useState(38); // % from the right (RTL), 0-100
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<number | null>(null);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-oscillate the slider unless the user is dragging it.
  useEffect(() => {
    let start: number | null = null;

    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      if (!dragging) {
        // Smooth sine oscillation between ~20% and ~80%
        const pct = 50 + Math.sin(elapsed * 0.6) * 30;
        setPosition(pct);
      }
      autoRef.current = requestAnimationFrame(tick);
    };

    autoRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoRef.current) cancelAnimationFrame(autoRef.current);
    };
  }, [dragging]);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // RTL-aware: 0% at the right edge, 100% at the left edge
    const pct = ((rect.right - clientX) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  };

  const startDrag = () => {
    setDragging(true);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const endDrag = () => {
    resumeTimeout.current = setTimeout(() => setDragging(false), 2500);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl2 overflow-hidden border border-line bg-panel aspect-square select-none touch-none"
      onMouseMove={(e) => dragging && updateFromClientX(e.clientX)}
      onMouseUp={endDrag}
      onMouseLeave={() => dragging && endDrag()}
      onTouchMove={(e) => dragging && updateFromClientX(e.touches[0].clientX)}
      onTouchEnd={endDrag}
    >
      {/* BEFORE layer (full width, sits underneath) */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#1A1D24] p-10">
        <svg viewBox="0 0 200 200" className="w-full h-full max-w-[220px] opacity-80">
          <rect x="0" y="0" width="200" height="200" fill="#1F222A" />
          <ellipse cx="100" cy="170" rx="70" ry="8" fill="#15171C" />
          <rect x="70" y="60" width="60" height="105" rx="6" fill="#3A3F4B" />
          <rect x="78" y="45" width="44" height="20" rx="4" fill="#4A5061" />
          <rect x="70" y="60" width="60" height="105" rx="6" fill="url(#flatShade)" />
          <defs>
            <linearGradient id="flatShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute bottom-4 text-[11px] text-white/25 tracking-wide">صورة أصلية</span>
      </div>

      {/* AFTER layer (clipped by drag position) */}
      <div
        className="absolute inset-0 flex items-center justify-center p-10 bg-gradient-to-br from-amber-900/50 via-panel to-panel"
        style={{ clipPath: `inset(0 ${position}% 0 0)` }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full max-w-[220px]">
          <defs>
            <radialGradient id="glow" cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#FFD98A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F0A020" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bottleShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE7B3" />
              <stop offset="45%" stopColor="#F0A020" />
              <stop offset="100%" stopColor="#B5650A" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="50" r="90" fill="url(#glow)" />
          <ellipse cx="100" cy="175" rx="55" ry="7" fill="#000" opacity="0.35" />
          <rect x="70" y="60" width="60" height="105" rx="6" fill="url(#bottleShine)" />
          <rect x="78" y="45" width="44" height="20" rx="4" fill="#D97F0B" />
          <rect x="74" y="64" width="10" height="97" rx="4" fill="#FFF3D6" opacity="0.5" />
        </svg>
        <span className="absolute bottom-4 text-[11px] text-amber-300/80 tracking-wide font-semibold">
          لقطة ShelfShot
        </span>
      </div>

      {/* Divider handle */}
      <div
        className="absolute inset-y-0 w-px bg-amber-500/60 cursor-ew-resize"
        style={{ right: `${position}%` }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shadow-lg cursor-ew-resize">
          <ScanLine size={16} className="text-ink" />
        </div>
      </div>
    </div>
  );
};
