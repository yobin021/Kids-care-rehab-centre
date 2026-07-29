"use client";

import React from "react";

export default function Toggle({
  value,
  onChange,
  label,
  options = [
    { label: "Yes", value: true },
    { label: "No", value: false }
  ]
}) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-bold text-[#2C2C2A]">{label}</label>}
      <div className="inline-flex items-center gap-1.5 p-1 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[20px]">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#185FA5] text-white shadow-xs"
                  : "bg-transparent text-[#5F5E5A] hover:text-[#2C2C2A]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
