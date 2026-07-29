"use client";

import React from "react";

export default function StatCard({ title, value, icon: Icon, color = "#185FA5", className = "" }) {
  return (
    <div className={`bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-between ${className}`}>
      <div>
        <span className="text-xs font-bold text-[#5F5E5A] block uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-black mt-1 block" style={{ color }}>{value}</span>
      </div>
      {Icon && (
        <div className="h-10 w-10 rounded-[8px] flex items-center justify-center font-bold" style={{ backgroundColor: `${color}15`, color }}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
