"use client";

import React from "react";

export default function Badge({
  label,
  variant = "blue",
  size = "md",
  className = ""
}) {
  const variants = {
    blue:    "bg-blue-600 text-white shadow-[0_1px_4px_rgba(37,99,235,0.35)]",
    teal:    "bg-emerald-600 text-white shadow-[0_1px_4px_rgba(5,150,105,0.35)]",
    violet:  "bg-violet-600 text-white shadow-[0_1px_4px_rgba(124,58,237,0.35)]",
    amber:   "bg-amber-500 text-white shadow-[0_1px_4px_rgba(217,119,6,0.35)]",
    coral:   "bg-rose-600 text-white shadow-[0_1px_4px_rgba(225,29,72,0.35)]",
    purple:  "bg-violet-600 text-white shadow-[0_1px_4px_rgba(124,58,237,0.35)]",
    green:   "bg-emerald-600 text-white shadow-[0_1px_4px_rgba(5,150,105,0.35)]",
    red:     "bg-rose-50 text-rose-600 border border-rose-200",
    gray:    "bg-slate-100 text-slate-600 border border-slate-200",
    "blue-soft":    "bg-blue-50 text-blue-700 border border-blue-200",
    "emerald-soft": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "violet-soft":  "bg-violet-50 text-violet-700 border border-violet-200",
    "amber-soft":   "bg-amber-50 text-amber-700 border border-amber-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] rounded-full",
    md: "px-2.5 py-0.5 text-xs rounded-full",
    lg: "px-3 py-1 text-xs rounded-full",
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold whitespace-nowrap transition-all ${
        variants[variant] || variants.blue
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {label}
    </span>
  );
}
