"use client";

import React from "react";

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  padding = "p-6"
}) {
  return (
    <div className={`bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${padding} ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-3 mb-4">
          <div>
            {title && <h3 className="text-base font-bold text-[#2C2C2A]">{title}</h3>}
            {subtitle && <p className="text-xs font-medium text-[#5F5E5A] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
