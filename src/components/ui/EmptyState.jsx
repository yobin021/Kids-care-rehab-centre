"use client";

import React from "react";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white p-10 text-center rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
      {Icon && <Icon className="h-10 w-10 text-[#9B9A96] mx-auto" />}
      <h4 className="text-sm font-bold text-[#2C2C2A]">{title}</h4>
      {description && <p className="text-xs text-[#5F5E5A] max-w-sm mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
