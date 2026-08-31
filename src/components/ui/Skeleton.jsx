"use client";

import React from "react";

export function SkeletonCard({ count = 3 }) {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#F8F8F6] p-5 rounded-[12px] border border-[#D3D1C7]/60 space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-[#D3D1C7]/60 rounded-md w-1/3" />
            <div className="h-4 bg-[#D3D1C7]/60 rounded-full w-16" />
          </div>
          <div className="h-3 bg-[#D3D1C7]/40 rounded-md w-2/3" />
          <div className="h-3 bg-[#D3D1C7]/40 rounded-md w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2.5 w-full animate-pulse">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`h-3.5 bg-[#D3D1C7]/50 rounded-md ${
            idx === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
