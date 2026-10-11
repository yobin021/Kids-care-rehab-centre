"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ isOpen, open, onClose, title, children, size = "md" }) {
  const active = isOpen !== undefined ? isOpen : (open !== undefined ? open : false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (active) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [active, onClose]);

  if (!active || !mounted) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Full Page Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card Centered in Page */}
      <div
        className={`relative z-10 bg-white rounded-2xl ${sizes[size] || sizes.md} w-full max-h-[90dvh] border border-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.20)] animate-scale-in overflow-hidden flex flex-col`}
      >
        {/* Header gradient strip */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 shrink-0" />

        <div className="p-4 sm:p-6 flex flex-col flex-1 overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
            <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-800 tracking-tight truncate pr-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 pr-0.5 space-y-4 touch-scroll">{children}</div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
