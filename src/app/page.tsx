"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "../context/AuthContext";

const AppRouter = dynamic(() => import("../router/AppRouter"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F6] text-[#185FA5] font-bold">
      <div className="flex items-center gap-2">
        <svg className="animate-spin h-6 w-6 text-[#185FA5]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Loading Kids Care Rehab Centre...</span>
      </div>
    </div>
  )
});

export default function Page() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
