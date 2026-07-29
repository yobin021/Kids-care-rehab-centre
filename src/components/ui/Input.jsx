"use client";

import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  helper,
  className = "",
  rows,
  ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#2C2C2A]">
          {label} {required && <span className="text-[#993C1D]">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          rows={rows || 3}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-3 border rounded-[8px] text-xs font-medium text-[#2C2C2A] bg-white outline-none transition-colors ${
            error ? "border-[#993C1D] focus:border-[#993C1D]" : "border-[#D3D1C7] focus:border-[#185FA5]"
          }`}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-10 px-3 border rounded-[8px] text-xs font-medium text-[#2C2C2A] bg-white outline-none transition-colors ${
            error ? "border-[#993C1D] focus:border-[#993C1D]" : "border-[#D3D1C7] focus:border-[#185FA5]"
          }`}
          {...props}
        />
      )}

      {error && <p className="text-[11px] font-bold text-[#993C1D]">{error}</p>}
      {helper && !error && <p className="text-[11px] font-semibold text-[#9B9A96]">{helper}</p>}
    </div>
  );
}
