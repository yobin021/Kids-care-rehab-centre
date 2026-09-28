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
  icon: Icon,
  ...props
}) {
  const baseInputClass = `w-full px-3.5 border rounded-[10px] text-[13px] font-medium bg-white outline-none transition-all duration-200 placeholder:text-slate-400 ${
    error
      ? "border-rose-400 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)] bg-rose-50/30"
      : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] focus:bg-white"
  }`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label}{" "}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          rows={rows || 3}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} py-3 resize-none leading-relaxed`}
          {...props}
        />
      ) : (
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseInputClass} h-11 ${Icon ? "pl-10" : "pl-3.5"}`}
            {...props}
          />
        </div>
      )}

      {error && (
        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-[11px] font-medium text-slate-400">{helper}</p>
      )}
    </div>
  );
}
