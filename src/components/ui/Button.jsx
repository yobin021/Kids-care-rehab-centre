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
  className = ""
}) {
  const baseStyle =
    "inline-flex items-center justify-center font-bold transition-colors rounded-[8px] cursor-pointer outline-none shadow-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";

  const variants = {
    primary: "bg-[#185FA5] hover:bg-[#12487e] text-white border border-[#185FA5]",
    secondary: "bg-[#0F6E56] hover:bg-[#0b5442] text-white border border-[#0F6E56]",
    outlined: "bg-white hover:bg-slate-100 text-[#2C2C2A] border border-[#D3D1C7]",
    ghost: "bg-transparent hover:bg-slate-200/60 text-[#2C2C2A]",
    danger: "bg-[#993C1D] hover:bg-[#803117] text-white border border-[#993C1D]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-xs h-10",
    lg: "px-6 py-2.5 text-sm h-11"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
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
