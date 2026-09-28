"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X, Zap } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      container: "bg-white border-l-4 border-emerald-500",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
      title: "text-emerald-700",
    },
    error: {
      container: "bg-white border-l-4 border-rose-500",
      icon: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
      title: "text-rose-700",
    },
    info: {
      container: "bg-white border-l-4 border-blue-500",
      icon: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
      title: "text-blue-700",
    },
    warning: {
      container: "bg-white border-l-4 border-amber-500",
      icon: <Zap className="h-4 w-4 text-amber-500 shrink-0" />,
      title: "text-amber-700",
    },
  };

  const c = config[type] || config.success;

  return (
    <div
      className={`${c.container} rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center gap-3 min-w-[280px] animate-slide-down`}
    >
      {c.icon}
      <span className={`text-[13px] font-semibold flex-1 ${c.title}`}>
        {message}
      </span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-1 p-0.5 rounded-lg hover:bg-slate-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
