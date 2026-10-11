"use client";

import React from "react";

export default function StatCard({ title, value, icon: Icon, color = "#2563EB", gradient = null, className = "" }) {
  const defaultGradient = `linear-gradient(135deg, ${color}22, ${color}0a)`;
  const iconGradient = gradient || `linear-gradient(135deg, ${color}dd, ${color}aa)`;

  return (
    <div
      className={`relative bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden p-5 flex items-center justify-between gap-4 ${className}`}
    >
      {/* Left color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: iconGradient }}
      />

      <div className="pl-3">
        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
          {title}
        </span>
        <span
          className="text-3xl font-black block leading-none"
          style={{ color }}
        >
          {value}
        </span>
      </div>

      {Icon && (
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: iconGradient }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
}
