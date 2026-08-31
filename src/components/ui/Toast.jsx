"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-[#3B6D11] text-white border-[#3B6D11]",
    error: "bg-[#993C1D] text-white border-[#993C1D]",
    info: "bg-[#185FA5] text-white border-[#185FA5]"
  };

  return (
    <div
      className={`p-3.5 rounded-[8px] border shadow-lg text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 ${
        styles[type] || styles.success
      }`}
    >
      <div className="flex items-center gap-2">
        {type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
        {type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
        {type === "info" && <Info className="h-4 w-4 shrink-0" />}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="hover:opacity-80 cursor-pointer">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
