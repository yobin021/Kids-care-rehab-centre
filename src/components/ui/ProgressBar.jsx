"use client";

import React from "react";

export default function ProgressBar({ value = 0, color = "#3B6D11", label, animated = true }) {
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1 w-full">
      {label && (
        <div className="flex items-center justify-between text-xs font-bold text-[#2C2C2A]">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className="w-full bg-[#F8F8F6] rounded-full h-3 overflow-hidden border border-[#D3D1C7]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${animated ? "ease-out" : ""}`}
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
