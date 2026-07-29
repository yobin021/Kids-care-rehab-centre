"use client";

import React from "react";

export default function Badge({
  label,
  variant = "blue",
  size = "md",
  className = ""
}) {
  const variants = {
    blue: "bg-[#185FA5] text-white",
    teal: "bg-[#0F6E56] text-white",
    purple: "bg-[#3C3489] text-white",
    coral: "bg-[#993C1D] text-white",
    amber: "bg-[#854F0B] text-white",
    green: "bg-[#3B6D11] text-white",
    red: "bg-[#993C1D]/10 text-[#993C1D] border border-[#993C1D]/30",
    gray: "bg-[#F8F8F6] text-[#5F5E5A] border border-[#D3D1C7]"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-xs"
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full transition-colors whitespace-nowrap ${
        variants[variant] || variants.blue
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {label}
    </span>
  );
}
