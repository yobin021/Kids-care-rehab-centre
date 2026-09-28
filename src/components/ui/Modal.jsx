"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, open, onClose, title, children }) {
  const active = isOpen !== undefined ? isOpen : (open !== undefined ? open : false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (active) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-[14px] p-4 sm:p-6 max-w-lg w-full max-h-[90dvh] border border-[#D3D1C7] shadow-xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3 mb-3 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-[#185FA5] truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 text-[#5F5E5A] hover:text-[#2C2C2A] rounded-full hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-0.5 space-y-4 touch-scroll">{children}</div>
      </div>
    </div>
  );
}
