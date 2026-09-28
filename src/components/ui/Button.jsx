"use client";

import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  type = "button",
  className = "",
  style = {}
}) {
  const baseStyle =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-[10px] cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none relative overflow-hidden select-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:translate-y-0 border-0",
    secondary:
      "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-[0_2px_8px_rgba(5,150,105,0.35)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.45)] hover:-translate-y-0.5 active:translate-y-0 border-0",
    violet:
      "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-[0_2px_8px_rgba(124,58,237,0.35)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 border-0",
    outlined:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 active:translate-y-0",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent",
    danger:
      "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-[0_2px_8px_rgba(225,29,72,0.30)] hover:shadow-[0_4px_16px_rgba(225,29,72,0.40)] hover:-translate-y-0.5 active:translate-y-0 border-0",
    amber:
      "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-[0_2px_8px_rgba(217,119,6,0.30)] hover:shadow-[0_4px_16px_rgba(217,119,6,0.40)] hover:-translate-y-0.5 active:translate-y-0 border-0",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs h-8 gap-1.5",
    md: "px-4 py-2 text-[13px] h-10 gap-1.5",
    lg: "px-6 py-2.5 text-sm h-11 gap-2",
    xl: "px-8 py-3 text-sm h-12 gap-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
}
