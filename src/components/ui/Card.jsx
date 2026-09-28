"use client";

import React from "react";

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  padding = "p-6",
  accent = null, // "blue" | "emerald" | "violet" | "amber"
}) {
  const accentGradients = {
    blue: "linear-gradient(90deg, #2563EB, #7C3AED)",
    emerald: "linear-gradient(90deg, #059669, #0891B2)",
    violet: "linear-gradient(90deg, #7C3AED, #DB2777)",
    amber: "linear-gradient(90deg, #D97706, #F59E0B)",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden ${padding} ${className}`}
    >
      {/* Top accent line on hover */}
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: accentGradients[accent] || accentGradients.blue }}
        />
      )}

      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            {title && (
              <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
